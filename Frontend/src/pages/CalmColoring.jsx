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
    const [canvasSize, setCanvasSize] = useState({ width: 700, height: 400 });

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

    // Add this useEffect for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {  // mobile breakpoint
                setCanvasSize({
                    width: window.innerWidth - 32, // 32px for padding
                    height: 300
                });
            } else {
                setCanvasSize({
                    width: 700,
                    height: 400
                });
            }
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-4 md:py-16 px-4 md:px-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-2 left-2 md:top-5 md:left-5 bg-white/10 hover:bg-white/20 text-white px-3 py-1 md:px-4 md:py-2 rounded-xl flex items-center gap-2 text-sm md:text-base"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* Title */}
            <div className="text-center mb-4 md:mb-8 mt-10 lg:mt-0">
                <h1 className="text-3xl md:text-5xl font-bold tracking-wide mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    Color and Relax
                </h1>
                <p className="text-sm md:text-lg text-gray-300">Find peace through coloring 🎨</p>
            </div>

            {/* Main Content - Stack vertically on mobile */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 max-w-7xl mx-auto">
                {/* Canvas Section */}
                <div className="w-full md:w-auto bg-white/5 backdrop-blur-lg rounded-xl p-3 md:p-6 border border-white/10">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        className="cursor-crosshair rounded-lg shadow-inner bg-white w-full"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            const rect = e.target.getBoundingClientRect();
                            const offsetX = touch.clientX - rect.left;
                            const offsetY = touch.clientY - rect.top;
                            startDrawing({ nativeEvent: { offsetX, offsetY } });
                        }}
                        onTouchMove={(e) => {
                            const touch = e.touches[0];
                            const rect = e.target.getBoundingClientRect();
                            const offsetX = touch.clientX - rect.left;
                            const offsetY = touch.clientY - rect.top;
                            draw({ nativeEvent: { offsetX, offsetY } });
                        }}
                        onTouchEnd={stopDrawing}
                    ></canvas>
                </div>

                {/* Controls Section - Horizontal scroll on mobile */}
                <div className="flex flex-col md:flex-col gap-4 overflow-x-auto md:overflow-visible w-full md:w-auto p-4 md:p-0 no-scrollbar justify-center items-center">
                    {/* Tools Panel */}
                    <div className="flex-shrink-0 bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10 w-[200px] md:w-[250px]">
                        <div className="flex flex-col gap-3">
                            {/* Color and basic tools */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-12 h-12 md:w-20 md:h-20 rounded-xl"
                                    disabled={isEraser}
                                />
                                <button
                                    className={`p-3 rounded-xl ${isEraser ? "bg-purple-500" : "bg-white/10"}`}
                                    onClick={toggleEraser}
                                >
                                    <Eraser size={20} />
                                </button>
                                <button
                                    className="bg-gradient-to-r from-rose-500 to-pink-500 p-3 rounded-xl"
                                    onClick={resetCanvas}
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                            
                            {/* Brush size slider */}
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl">
                                <div className="w-4 h-4 rounded-full bg-current" 
                                    style={{ width: `${brushSize}px`, height: `${brushSize}px` }} 
                                />
                                <input
                                    type="range"
                                    min="1"
                                    max="32"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    className="w-full accent-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Music Controls Panel */}
                    <div className="flex-shrink-0 bg-white/5 backdrop-blur-lg p-4 rounded-xl border border-white/10 w-[200px] md:w-[250px]">
                        <div className="flex items-center gap-3">
                            <button
                                className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl"
                                onClick={toggleMusic}
                            >
                                <Music size={20} />
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={musicVolume}
                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalmColoring;
