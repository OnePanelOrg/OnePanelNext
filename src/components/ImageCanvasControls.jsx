import React from "react";

const ImageCanvasControls = ({
  currentPageIndex,
  imagesLenght,
  currentPanelIndex,
  panelsInThisPage,
  handleLeftArrow,
  handleRightArrow,
}) => {
  return (
    <div
      className="rounded-lg bg-neutral-100 p-5 shadow-lg"
      style={{ position: "absolute", bottom: 20, right: 20 }}
    >
      <div className="flex items-center justify-between">
        <button
          className="rounded bg-emerald-400 p-5 text-white transition-colors duration-200 hover:bg-emerald-700"
          onClick={handleLeftArrow}
        >
          Left
        </button>
        <div className="text-center">
          <span className="block p-5">
            Page: {currentPageIndex + 1}/{imagesLenght}
          </span>
          <span className="block p-5">
            Panel: {currentPanelIndex + 1}/{panelsInThisPage}
          </span>
        </div>
        <button
          className="rounded bg-emerald-400 p-5 text-white transition-colors duration-200 hover:bg-emerald-700"
          onClick={handleRightArrow}
        >
          Right
        </button>
      </div>
    </div>
  );
};
export default ImageCanvasControls;
