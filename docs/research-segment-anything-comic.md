# `segment-anything-comic` assessment for OnePanel

Assessment date: 2026-07-30  
External revision inspected: [`069288e`](https://github.com/Vrroom/segment-anything-comic/tree/069288e7ebdd4f532cbbc3a59c95614223f3e117)

## Recommendation

Treat `segment-anything-comic` as a promising research prototype to benchmark,
not as a dependency to introduce into `OnePanelNext`.

Its objective aligns with OnePanel: it adapts Segment Anything to predict the
four corners of a comic frame. However, it is a CUDA-dependent Python model
with a Gradio demo, not a JavaScript library or production inference API. If it
proves accurate enough, the right integration point is a separate GPU worker
behind the OnePanel API. The existing Next.js frontend should continue to
receive validated chapter images and panel paths from that API.

Before adoption, run a time-boxed backend spike on representative OnePanel
pages. Measure panel recall/precision or IoU, missed and duplicate panels,
reading-order accuracy after post-processing, latency, VRAM, concurrency, and
whether the separately hosted fine-tuned checkpoint remains obtainable and
redistributable.

## What the project does

The repository describes itself as code for training and running a SAM model
modified to predict polygon segmentations of comic frames
([README](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/README.md)).
In concrete terms, its prediction is a fixed four-point polygon rather than an
arbitrary outline:

- It constructs SAM with the ViT-H backbone.
- It takes SAM prompt tokens and passes them through separate MLP heads for four
  x-coordinates, four y-coordinates, and a confidence score.
- Training uses a combination of L1, MSE, relative-orientation, and confidence
  losses. The SAM image encoder runs without gradients, while the training
  entry point tracks the new projection heads and SAM prompt/mask components.

These details are visible in
[`model.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/model.py)
and
[`main.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/main.py).

The supplied data pipeline also generates composite training examples and
normalizes quadrilateral geometry; it is training infrastructure, not a
ready-made manga ingestion pipeline
([`datamodule.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/datamodule.py)).

## Interfaces and outputs

There is no documented REST API, stable wire format, or production server.
The exposed application is a Gradio UI:

- Interactive inference accepts an RGB NumPy image and one or more clicked
  points. It returns an annotated image and four integer `[x, y]` vertices.
- The simpler Python methods can return just those four vertices and can reuse
  precomputed image features.
- "Full" inference samples a 20 by 20 point grid, scores the resulting
  quadrilaterals, and clusters the top candidates. In its current form it
  returns only a 256-pixel annotated preview, not structured polygon data.
- The installer launches the interactive, click-prompted demo
  (`app_int.py`), while `app.py` exercises the automatic full-image method.

Sources:
[`model.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/model.py),
[`app_int.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/app_int.py),
and
[`app.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/app.py).

Consequently, the code does not yet provide several things OnePanel needs:

1. A structured list of every panel on a page.
2. Deduplication and confidence policy suitable for unattended processing.
3. Manga reading order.
4. Conversion from pixel coordinates to OnePanel's percentage-coordinate path
   string.
5. A versioned, validated service contract with observable failures.

The click-prompted method may nevertheless be useful for an editor or
correction workflow, because a person can select a missed panel and receive its
quadrilateral.

## Runtime and operational constraints

This cannot run inside the browser or a normal Next.js server deployment:

- The environment is explicitly `linux-64` and Python 3.10
  ([`spec_file.txt`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/spec_file.txt)).
- Dependencies include PyTorch Lightning 2.0.9, torchvision 0.16, OpenCV,
  scikit-learn, Shapely, and Gradio 3.50
  ([`requirements.txt`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/requirements.txt)).
- Inference uses unconditional `.cuda()` calls and training explicitly selects
  the GPU accelerator
  ([`model.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/model.py),
  [`main.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/main.py)).
- Installation downloads Meta's SAM ViT-H checkpoint and a separate
  fine-tuned checkpoint from Google Drive that the script describes as 2.6 GB.
  Neither weight file is committed
  ([`install_and_run.sh`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/install_and_run.sh)).
- At its defaults, full inference encodes the image once and then performs 400
  prompt/mask-decoder iterations sequentially. This is an operational risk to
  benchmark rather than an established production latency
  ([`model.py`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/model.py)).

A production adaptation would need a pinned, reproducible image; durable model
weight storage; startup/readiness checks; request size limits; GPU capacity and
queue management; batching or optimization; timeouts; and metrics. Gradio
should not be treated as the OnePanel production API.

## Fit with the current OnePanel architecture

OnePanelNext is a Next.js 15 frontend. Its browser API client sends chapter
requests through the same-origin `/api/onepanel` rewrite, validates responses
with Zod, and expects:

```text
chapter
└── pages[]
    ├── image: non-empty URL
    └── panels[]
        └── path: non-empty percentage-coordinate polygon string
```

See [`src/lib/api.ts`](../src/lib/api.ts),
[`next.config.mjs`](../next.config.mjs), and the canvas consumption in
[`src/components/ImageCanvas.jsx`](../src/components/ImageCanvas.jsx).

The appropriate shape is therefore:

```text
OnePanelNext
    │ authenticated chapter request / validated chapter response
    ▼
OnePanel API
    │ owns ingestion, authorization, storage, ordering, validation, retries
    ▼
GPU panel-detection worker
    │ image pixels in; candidate quadrilaterals + scores out
    ▼
adapted segment-anything-comic model
```

The API/worker adapter would need to change automatic inference to return
candidate polygons and scores, reject malformed/out-of-bounds geometry,
deduplicate candidates, determine reading order, and convert pixel vertices to
the frontend's `0..100` path representation. A failed page must remain a
page-scoped processing error so that one failure does not block the whole
chapter, consistent with the repository's application rules.

Introducing this code directly into `OnePanelNext` would mix a large GPU Python
runtime into the frontend, bypass the existing API boundary, and still not
produce the contract the reader consumes.

## License and maturity

The source repository contains the Apache License 2.0
([`LICENSE`](https://github.com/Vrroom/segment-anything-comic/blob/069288e7ebdd4f532cbbc3a59c95614223f3e117/LICENSE)).
That is favorable for adaptation, but the separately downloaded fine-tuned
checkpoint and its training-data provenance should be reviewed independently
before redistribution or commercial use. The installer identifying a Drive
file does not itself document those artifact rights.

Signals indicate a research/student project rather than a maintained
production library:

- The latest repository commit inspected is from 2024-03-14.
- The repository has no tags or GitHub releases.
- There is no container, CI workflow, versioned inference contract, or focused
  inference test suite in the checked-in tree.
- Setup is an interactive Conda shell script and the documentation is brief.

The canonical repository and its current activity metadata are available on
[GitHub](https://github.com/Vrroom/segment-anything-comic). These signals do not
make the model unusable, but they mean OnePanel would own hardening,
maintenance, deployment, and probably further model evaluation.

## Suggested spike acceptance criteria

Adopt or fork the model only if a representative test set demonstrates:

- acceptable whole-page panel recall with a defined false-positive budget;
- acceptable quadrilateral overlap, including irregular and borderless panels;
- deterministic, correct post-processed reading order;
- acceptable p50/p95 page latency and VRAM at expected concurrency;
- no chapter-wide failure when an individual page cannot be processed;
- a stable structured output that can be validated before reaching the
  frontend; and
- confirmed availability and acceptable licensing/provenance for all required
  weights and evaluation material.

If automatic recall is not sufficient, the click-prompted path could still be
evaluated as an internal correction tool rather than the primary detector.
