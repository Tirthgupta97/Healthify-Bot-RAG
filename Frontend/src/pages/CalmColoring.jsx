import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Music } from "lucide-react";

const CalmColoring = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState("#ff6b6b"); // Default brush color
    const [brushSize, setBrushSize] = useState(8); // Default brush size
    const [isDrawing, setIsDrawing] = useState(false);
    const [backgroundMusic, setBackgroundMusic] = useState(new Audio("/music/relaxing.mp3"));

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctxRef.current = ctx;

        const img = new Image();
        img.src = "/images/drawing.png"; // Your drawing outline
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }, []);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        ctxRef.current.strokeStyle = selectedColor;
        ctxRef.current.lineWidth = brushSize;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        ctxRef.current.closePath();
    };

    const resetCanvas = () => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const img = new Image();
        img.src = "/images/drawing.png";
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        };
    };

    const toggleMusic = () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white px-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-5 left-5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-wide mb-2">Color and Relax</h1>
            <p className="text-lg text-gray-300 mb-6">Color to relax your mind 🖌️</p>

            {/* Centered Layout (Canvas + Controls in One Row) */}
            <div className="flex flex-wrap justify-center items-center gap-12">
                {/* Canvas Section */}
                <div className="relative bg-white shadow-lg rounded-lg p-4">
                    <canvas
                        ref={canvasRef}
                        width={700}
                        height={400}
                        className="cursor-crosshair border border-gray-300"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    ></canvas>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col items-center gap-6">
                    {/* Color Picker */}
                    <div className="flex flex-col items-center">
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-16 h-16 border-2 border-white cursor-pointer"
                        />
                        <p className="text-lg mt-2">Brush Color</p>
                    </div>

                    {/* Brush Size */}
                    <div className="flex flex-col items-center">
                        <input
                            type="range"
                            min="2"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(e.target.value)}
                            className="w-40 cursor-pointer"
                        />
                        <p className="text-lg mt-2">Brush Size</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-6">
                        <button
                            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
                            onClick={resetCanvas}
                        >
                            <RefreshCw size={24} /> Reset
                        </button>

                        <button
                            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
                            onClick={toggleMusic}
                        >
                            <Music size={24} /> Music
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalmColoring;
