import React from "react";

const arrowButton =
  "grid h-11 w-11 place-items-center border-2 border-paper bg-transparent text-lg font-bold text-paper transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-paper";

const ImageCanvasControls = ({
  currentPageIndex,
  imagesLength,
  currentPanelIndex,
  panelsInThisPage,
  handleLeftArrow,
  handleRightArrow,
  isAtStart,
  isAtEnd,
}) => {
  return (
    <div className="pointer-events-auto fixed bottom-5 left-1/2 z-10 -translate-x-1/2 border-3 border-paper bg-ink px-3 py-2">
      <div className="flex items-center gap-4">
        <button
          className={arrowButton}
          onClick={handleLeftArrow}
          disabled={isAtStart}
          aria-label="Previous panel"
        >
          <span aria-hidden="true">←</span>
        </button>
        <p className="text-center font-mono text-[11px] uppercase leading-tight tracking-[0.14em] text-paper/70">
          <span className="block">
            Page {currentPageIndex + 1}/{imagesLength}
          </span>
          <span className="mt-0.5 block text-paper">
            Panel {currentPanelIndex + 1}/{panelsInThisPage}
          </span>
        </p>
        <button
          className={arrowButton}
          onClick={handleRightArrow}
          disabled={isAtEnd}
          aria-label="Next panel"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
};
export default ImageCanvasControls;
