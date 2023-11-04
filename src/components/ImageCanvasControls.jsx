import React from 'react';

const ImageCanvasControls = ({ currentPageIndex, imagesLenght, currentPanelIndex, panelsInThisPage, handleLeftArrow, handleRightArrow }) => {
    return (
        <div className="bg-white p-5" style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <div className='flex justify-between'>
                <button className="p-5" onClick={handleLeftArrow}>Left</button>
                <span className="p-5">Page: {currentPageIndex+1}/{imagesLenght}</span>
                <span className="p-5">Panel: {currentPanelIndex+1}/{panelsInThisPage}</span>
                <button className="p-5" onClick={handleRightArrow}>Right</button>
            </div>
        </div>
    );
};
export default ImageCanvasControls;