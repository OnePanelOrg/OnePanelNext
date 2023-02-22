import { useEffect, useRef, useState } from 'react';

const ImageCanvas = ({ data }) => {
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const loadedImages = [];
        let loadedCount = 0;
        data.pages.forEach((element, index) => {
            const image = new Image();
            image.onload = () => {
                loadedCount++;
                if (loadedCount === data.pages.length) {
                    setImages(loadedImages);
                }
            };
            image.src = element.image;
            loadedImages.push(image);
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                // todo: fix loop
                setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
            } else if (event.key === 'ArrowRight') {
                setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [images]);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (images.length > 0) {
            const currentImage = images[currentIndex];

            ctx.drawImage(currentImage, 0, 0, currentImage.width / currentImage.height * window.innerHeight, window.innerHeight);
        }
    }, [currentIndex, images]);

    return (
        <canvas id="image-canvas" ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
    );
};
export default ImageCanvas;