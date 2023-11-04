import { useEffect, useRef, useState } from 'react';
import ImageCanvasControls from './ImageCanvasControls';

const ImageCanvas = ({ data }) => {
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
    const [panelsInThisPage, setpanelsInThisPage] = useState(0);

    // load data
    useEffect(() => {
        const loadedImages = [];
        let loadedCount = 0;

        data.pages.forEach((element, index) => {
            const image = new Image();
            image.onload = () => {
                loadedCount++;
                if (loadedCount === data.pages.length) {
                    setImages(loadedImages);
                    // setData(data);
                }
            };
            image.src = element.image;
            loadedImages.push(image);
        });
    }, []);


    // useEffect(() => {
    //     window.history.pushState(
    //         null,
    //         "",
    //         `?page=${currentPageIndex}&panel=${currentPanelIndex}_${panelsInThisPage-1}`
    //     );

    // }, [currentPageIndex, currentPanelIndex]);

    function nextPage() {
        setCurrentPanelIndex(0);
        if (currentPageIndex === data.pages.length - 1) {
            console.log("we are in the last page, now you will see page 0");
            setCurrentPageIndex(0);
        } else {
            setCurrentPageIndex(currentPageIndex + 1);
            setpanelsInThisPage(data.pages[currentPageIndex + 1].panels.length);
        }
    }

    function previousPage(){
        // TODO: change this to show all the panels of previous page
        // setCurrentPanelIndex(images[currentPageIndex-1].length-1);
        setCurrentPanelIndex(0);
        setCurrentPageIndex(currentPageIndex-1);
        return;
    }

    function handleRightArrow() {
        if (currentPanelIndex >= panelsInThisPage - 1){
            return nextPage();
        }
        return setCurrentPanelIndex(currentPanelIndex + 1);
    }

    function handleLeftArrow() {
        if(currentPanelIndex == 0 ){
            return previousPage();
        }
        return setCurrentPanelIndex(currentPanelIndex - 1);
    }

    function setCanvasSize(canvas) {
        var parent = canvas.parentNode,
            styles = getComputedStyle(parent),
            w = parseInt(styles.getPropertyValue("width"), 10),
            h = parseInt(styles.getPropertyValue("height"), 10);
        canvas.width = w;
        canvas.height = h;
    }

    function _drawPanels(ctx, currentImage) {
        const max = data.pages[currentPageIndex].panels.length;
        const panels_len = Math.min(Math.max(parseInt(currentPanelIndex + 1), 0), max);

        // Because of the way canvas works we need all panels up
        // to and including the desired one.
        for (var i = 0; i < panels_len; i++) {

            // The path needs to be split in order to work with it.
            _drawPanel(ctx, currentImage, i);
        }
    }

    function _drawPanel(ctx, currentImage, i) {
        console.log("printing panel ", i+1, "/", panelsInThisPage)
        const path = data.pages[currentPageIndex].panels[i].path.split(',');
        const len = path.length;

        ctx.save();

        // First we draw a clipping path for the panel
        ctx.beginPath();
        for (var j = 0; j < len; j++) {
            const coards = path[j].trim().split(' ');

            // The svg path's coardinates commands need to be in pixels
            // instead of percentages. Svg path do not work with %s.
            const x = coards[0] * currentImage.width / currentImage.height * window.innerHeight / 100;
            const y = coards[1] * window.innerHeight / 100;

            // The first element in the path needs to
            // be the M(ove) command/
            if (len == 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(currentImage, 0, 0, currentImage.width / currentImage.height * window.innerHeight, window.innerHeight);

        ctx.restore();
    }

    function _drawPage(ctx, currentImage) {
        ctx.save();
        canvasRef.width = currentImage.width;
        canvasRef.height = currentImage.height;
        ctx.globalAlpha = 0.025;
        ctx.drawImage(currentImage, 0, 0, currentImage.width / currentImage.height * window.innerHeight, window.innerHeight);
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // draw things
    useEffect(() => {
        let panels_in_this_page = data.pages[currentPageIndex].panels.length;
        setpanelsInThisPage(panels_in_this_page)

        const ctx = canvasRef.current.getContext('2d');

        // fitToContainer(canvasRef);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (images.length > 0) {
            const currentImage = images[currentPageIndex];

            _drawPage(ctx, currentImage)
            _drawPanels(ctx, currentImage);
        }        
    }, [currentPageIndex, currentPanelIndex, images]);

    return (
        <div className='flex'>
            <canvas id="image-canvas" ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
            <ImageCanvasControls
                currentPageIndex={currentPageIndex}
                currentPanelIndex={currentPanelIndex}
                handleLeftArrow={handleLeftArrow}
                handleRightArrow={handleRightArrow}
                panelsInThisPage={panelsInThisPage}
                imagesLenght={images.length}
            ></ImageCanvasControls>
        </div>
    );
};
export default ImageCanvas;