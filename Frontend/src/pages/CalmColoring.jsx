import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Music, Eraser, Palette } from "lucide-react";

const CalmColoring = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState("#ff6b6b"); // Default brush color
    const [brushSize, setBrushSize] = useState(8); // Default brush size
    const [isDrawing, setIsDrawing] = useState(false);
    const [backgroundMusic, setBackgroundMusic] = useState(new Audio("/music/Watr-Fluid.mp3"));
    const [musicVolume, setMusicVolume] = useState(0.5); // Default volume 50%
    const [isEraser, setIsEraser] = useState(false);
    const [previousColor, setPreviousColor] = useState("#ff6b6b");

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

    // Add this after other useEffect hooks
    useEffect(() => {
        backgroundMusic.volume = musicVolume;
    }, [musicVolume, backgroundMusic]);

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

    const toggleEraser = () => {
        if (isEraser) {
            setSelectedColor(previousColor);
        } else {
            setPreviousColor(selectedColor);
            setSelectedColor("#FFFFFF");
        }
        setIsEraser(!isEraser);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-16 px-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-5 left-5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Title */}
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold tracking-wide mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    Color and Relax
                </h1>
                <p className="text-lg text-gray-300">Find peace through coloring 🎨</p>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-start gap-8 max-w-7xl mx-auto">
                {/* Canvas Section */}
                <div className="bg-white/5 backdrop-blur-lg shadow-2xl rounded-2xl p-6 border border-white/10">
                    <canvas
                        ref={canvasRef}
                        width={700}
                        height={400}
                        className="cursor-crosshair rounded-lg shadow-inner bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    ></canvas>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col items-center gap-8 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 w-[250px]">
                    {/* Color Picker */}
                    <div className="flex flex-col items-center gap-2">
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="w-20 h-20 rounded-2xl border-2 border-white/20 cursor-pointer bg-transparent"
                            disabled={isEraser}
                        />
                        <p className="text-white/90 font-medium">Brush Color</p>
                    </div>

                    {/* Tools */}
                    <button
                        className={`p-4 rounded-xl flex items-center justify-center transition-all ${isEraser
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                            }`}
                        onClick={toggleEraser}
                    >
                        <Eraser size={24} />
                    </button>

                    {/* Brush Size */}
                    <input
                        type="range"
                        min="2"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(e.target.value)}
                        className="w-48 accent-purple-500 cursor-pointer"
                    />
                    <p className="text-white/90 font-medium">
                        Brush Size: {brushSize}px
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 rounded-xl flex items-center gap-2 text-lg font-medium"
                            onClick={resetCanvas}
                        >
                            <RefreshCw size={24} /> Reset
                        </button>
                    </div>
                </div>

                {/* Music Controls */}
                <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 w-[250px]">
                    <button
                        className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-xl flex items-center gap-2 text-lg font-medium"
                        onClick={toggleMusic}
                    >
                        <Music size={24} /> Music
                    </button>

                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-full">
                        <Music size={20} className="text-purple-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={musicVolume}
                            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                            className="w-full accent-purple-500 cursor-pointer"
                        />
                    </div>
                    <p className="text-white/90 font-medium text-sm">
                        Volume: {Math.round(musicVolume * 100)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalmColoring;
