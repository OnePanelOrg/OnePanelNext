import React from "react";

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
    <div
      className="rounded-lg bg-neutral-100 p-5 shadow-lg"
      style={{ position: "absolute", bottom: 20, right: 20 }}
    >
      <div className="flex items-center justify-between">
        <button
          className="rounded bg-emerald-500 p-5 text-white transition-colors duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={handleLeftArrow}
          disabled={isAtStart}
          aria-label="Previous panel"
        >
          Left
        </button>
        <div className="text-center">
          <span className="block p-5">
            Page: {currentPageIndex + 1}/{imagesLength}
          </span>
          <span className="block p-5">
            Panel: {currentPanelIndex + 1}/{panelsInThisPage}
          </span>
        </div>
        <button
          className="rounded bg-emerald-500 p-5 text-white transition-colors duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={handleRightArrow}
          disabled={isAtEnd}
          aria-label="Next panel"
        >
          Right
        </button>
      </div>
    </div>
  );
};
export default ImageCanvasControls;
