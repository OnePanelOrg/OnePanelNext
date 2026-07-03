import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageCanvasControls from "./ImageCanvasControls";
import ErrorMessage from "./ErrorMessage";
import { getNextPosition, getPreviousPosition } from "../lib/reader-state.mjs";

const pendingImage = () => ({ status: "loading", image: null });

const ImageCanvas = ({ data }) => {
  const canvasRef = useRef(null);
  const [imageStates, setImageStates] = useState(() =>
    data.pages.map(pendingImage),
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [viewport, setViewport] = useState({ width: 1, height: 1 });

  useEffect(() => {
    let cancelled = false;
    setImageStates(data.pages.map(pendingImage));

    const images = data.pages.map((page, index) => {
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        setImageStates((states) =>
          states.map((state, stateIndex) =>
            stateIndex === index ? { status: "loaded", image } : state,
          ),
        );
      };
      image.onerror = () => {
        if (cancelled) return;
        setImageStates((states) =>
          states.map((state, stateIndex) =>
            stateIndex === index ? { status: "error", image: null } : state,
          ),
        );
      };
      image.src = page.image;
      return image;
    });

    return () => {
      cancelled = true;
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [data.pages]);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const panelCounts = useMemo(
    () => data.pages.map((page) => page.panels.length),
    [data.pages],
  );
  const panelsInThisPage = panelCounts[currentPageIndex];
  const isAtStart = currentPageIndex === 0 && currentPanelIndex === 0;
  const isAtEnd =
    currentPageIndex === data.pages.length - 1 &&
    currentPanelIndex === panelsInThisPage - 1;

  const handleRightArrow = useCallback(() => {
    const next = getNextPosition(
      currentPageIndex,
      currentPanelIndex,
      panelCounts,
    );
    setCurrentPageIndex(next.pageIndex);
    setCurrentPanelIndex(next.panelIndex);
  }, [currentPageIndex, currentPanelIndex, panelCounts]);

  const handleLeftArrow = useCallback(() => {
    const previous = getPreviousPosition(
      currentPageIndex,
      currentPanelIndex,
      panelCounts,
    );
    setCurrentPageIndex(previous.pageIndex);
    setCurrentPanelIndex(previous.panelIndex);
  }, [currentPageIndex, currentPanelIndex, panelCounts]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") handleLeftArrow();
      if (event.key === "ArrowRight") handleRightArrow();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLeftArrow, handleRightArrow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const currentImage = imageStates[currentPageIndex]?.image;
    if (!canvas || !currentImage) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const displayHeight = viewport.height;
    const displayWidth =
      (currentImage.width / currentImage.height) * displayHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(displayWidth * pixelRatio);
    canvas.height = Math.round(displayHeight * pixelRatio);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, displayWidth, displayHeight);

    context.save();
    context.globalAlpha = 0.025;
    context.drawImage(currentImage, 0, 0, displayWidth, displayHeight);
    context.restore();

    const panels = data.pages[currentPageIndex].panels;
    for (let panelIndex = 0; panelIndex <= currentPanelIndex; panelIndex++) {
      const coordinates = panels[panelIndex].path.split(",");
      context.save();
      context.beginPath();
      coordinates.forEach((coordinate, coordinateIndex) => {
        const [rawX, rawY] = coordinate.trim().split(/\s+/);
        const x = (Number(rawX) / 100) * displayWidth;
        const y = (Number(rawY) / 100) * displayHeight;
        if (coordinateIndex === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      context.clip();
      context.drawImage(currentImage, 0, 0, displayWidth, displayHeight);
      context.restore();
    }
  }, [currentPageIndex, currentPanelIndex, data.pages, imageStates, viewport]);

  const currentImageState = imageStates[currentPageIndex];

  return (
    <div className="relative min-h-screen w-full overflow-auto bg-gray-950">
      {currentImageState?.status === "loading" && (
        <div className="flex min-h-screen items-center justify-center text-white">
          Loading page image…
        </div>
      )}
      {currentImageState?.status === "error" && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <ErrorMessage message="This page image could not be loaded. You can continue to another page." />
        </div>
      )}
      <canvas
        id="image-canvas"
        ref={canvasRef}
        aria-label={`Chapter page ${currentPageIndex + 1}, panel ${
          currentPanelIndex + 1
        }`}
      />
      <ImageCanvasControls
        currentPageIndex={currentPageIndex}
        currentPanelIndex={currentPanelIndex}
        handleLeftArrow={handleLeftArrow}
        handleRightArrow={handleRightArrow}
        panelsInThisPage={panelsInThisPage}
        imagesLength={data.pages.length}
        isAtStart={isAtStart}
        isAtEnd={isAtEnd}
      />
    </div>
  );
};

export default ImageCanvas;
