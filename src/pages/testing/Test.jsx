import React, { useRef, useState } from 'react';

const CameraCapture = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Запуск камеры
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (err) {
            console.error("Error accessing camera: ", err);
        }
    };

    // Остановка камеры
    const stopCamera = () => {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach(track => {
            track.stop();
        });

        videoRef.current.srcObject = null;
    };

    // Захват изображения
    const capturePhoto = () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageDataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
    };

    return (
        <div>
            <video ref={videoRef} width="640" height="480" autoPlay></video>
            <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>

            <div>
                <button onClick={startCamera}>Start Camera</button>
                <button onClick={capturePhoto}>Capture Photo</button>
                <button onClick={stopCamera}>Stop Camera</button>
            </div>

            {capturedImage && (
                <div>
                    <h2>Captured Image:</h2>
                    <img src={capturedImage} alt="Captured" />
                </div>
            )}
        </div>
    );
};

export default CameraCapture;
