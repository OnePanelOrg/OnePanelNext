import { useEffect, useRef, useState } from 'react';

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

    function handleRightArrow() {
        setCurrentPanelIndex((prevIndex) => {
            if (prevIndex === panelsInThisPage - 1) {
                console.log('Go to next page');
                setCurrentPageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
                return 0;
            } else {
                return prevIndex + 1
            }
        });
    }

    // handle arrow keys
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                // todo: fix loop
                setCurrentPageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
            } else if (event.key === 'ArrowRight') {
                handleRightArrow();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPanelIndex, images]);

    // draw things
    useEffect(() => {
        let panels_in_this_page = data.pages[currentPageIndex].panels.length;
        console.log("____panels_in_this_page", panels_in_this_page);
        setpanelsInThisPage(panels_in_this_page)

        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (images.length > 0) {
            const currentImage = images[currentPageIndex];

            const max = data.pages[currentPageIndex].panels.length;
            const panels_len = Math.min(Math.max(parseInt(currentPanelIndex + 1), 0), max);

            // Because of the way canvas works we need all panels up
            // to and including the desired one.
            for (var i = 0; i < panels_len; i++) {
                // The path needs to be split in order to work with it.
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
        }
    }, [currentPageIndex, currentPanelIndex, images]);

    return (
        <>
            {/* <ol className='pagination'>
                {data.pages.map((p, index) => (
                    <li><a href={"#" + string((index + 1 < 10) ? '0' + (index + 1) : index + 1) + "-01"} className='pagination-link' data-index={index}>{index}</a></li>
                ))}
            </ol> */}
            <canvas id="image-canvas" ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        </>
    );
};
export default ImageCanvas;