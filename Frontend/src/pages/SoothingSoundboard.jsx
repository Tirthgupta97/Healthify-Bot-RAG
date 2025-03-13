import React, { useState } from "react";
import { Play, Pause, Volume2, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// List of relaxing sounds
const sounds = [
    { id: 1, name: "Rain", src: "/sounds/rain.mp3", emoji: "🌧️", gif: "/gifs/rain.gif" },
    { id: 2, name: "Ocean", src: "/sounds/ocean.mp3", emoji: "🌊", gif: "/gifs/ocean.gif" },
    { id: 3, name: "Forest", src: "/sounds/forest.mp3", emoji: "🌲", gif: "/gifs/forest.gif" },
    { id: 4, name: "Fireplace", src: "/sounds/fireplace.mp3", emoji: "🔥", gif: "/gifs/fireplace.gif" },
    { id: 5, name: "Wind Chimes", src: "/sounds/windchimes.mp3", emoji: "🎐", gif: "/gifs/windchimes.gif" },
];

const SoothingSoundboard = () => {
    const [playing, setPlaying] = useState({});
    const [volume, setVolume] = useState(0.5);
    const [currentGif, setCurrentGif] = useState(null);
    const navigate = useNavigate();

    // Handle Play/Pause Toggle
    const togglePlay = (id, src, gif) => {
        // If the clicked sound is already playing, pause it
        if (playing[id]) {
            playing[id].pause();
            setPlaying((prev) => ({ ...prev, [id]: null }));
            setCurrentGif(null);
            return;
        }

        // Stop any currently playing sounds
        Object.values(playing).forEach((audio) => {
            if (audio) audio.pause();
        });

        // Play the new sound
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = volume;
        audio.play();
        
        // Update state
        setPlaying({ [id]: audio });
        setCurrentGif(gif);
    };

    // Handle Volume Change
    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        Object.values(playing).forEach((audio) => {
            if (audio) audio.volume = newVolume;
        });
    };

    // Stop All Sounds
    const stopAll = () => {
        Object.values(playing).forEach((audio) => {
            if (audio) audio.pause();
        });
        setPlaying({});
        setCurrentGif(null);
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 text-white relative overflow-hidden px-4">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-10 -top-10 w-72 h-72 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -right-10 -top-10 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-2000"></div>
                <div className="absolute -bottom-10 left-20 w-72 h-72 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-4000"></div>
            </div>

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-50 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl 
                          flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10"
            >
                <ArrowLeft size={20} /> Back
            </motion.button>

            {/* Main Content */}
            <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-4xl mx-auto h-full py-8">
                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-wide mb-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 text-transparent bg-clip-text py-1">
                        Soothing Soundboard
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300">Relax with nature's sounds 🌿🎶</p>
                </motion.div>

                {/* Content Container */}
                <div className="flex w-full gap-6">
                    {/* Sound Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                        {sounds.map((sound) => (
                            <motion.div
                                key={sound.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative group flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl backdrop-blur-sm 
                                         border transition-all duration-300 cursor-pointer shadow-lg
                                         ${playing[sound.id]
                                             ? "bg-emerald-500/20 border-emerald-400/30 shadow-emerald-500/20"
                                             : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                                onClick={() => togglePlay(sound.id, sound.src, sound.gif)}
                            >
                                <span className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {sound.emoji}
                                </span>
                                <p className="text-sm sm:text-base font-medium text-gray-200">{sound.name}</p>
                                <motion.div
                                    animate={{ scale: playing[sound.id] ? 1.2 : 1 }}
                                    className="absolute bottom-1 opacity-60 group-hover:opacity-100 transition-opacity"
                                >
                                    {playing[sound.id] ? <Pause size={16} /> : <Play size={16} />}
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Gif Display */}
                    {currentGif && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex-shrink-0 w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-4 border-emerald-500/30 shadow-lg"
                        >
                            <img 
                                src={currentGif} 
                                alt="Relaxing Scene" 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Volume Control */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10"
                    >
                        <Volume2 size={20} className="text-emerald-400" />
                        <div className="relative w-32 sm:w-40">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-full h-2 bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-full appearance-none cursor-pointer
                                         relative z-10
                                         [&::-webkit-slider-thumb]:appearance-none 
                                         [&::-webkit-slider-thumb]:w-4
                                         [&::-webkit-slider-thumb]:h-4 
                                         [&::-webkit-slider-thumb]:rounded-full 
                                         [&::-webkit-slider-thumb]:bg-emerald-400
                                         [&::-webkit-slider-thumb]:border-2
                                         [&::-webkit-slider-thumb]:border-emerald-300
                                         [&::-webkit-slider-thumb]:shadow-lg
                                         [&::-webkit-slider-thumb]:hover:scale-110
                                         [&::-webkit-slider-thumb]:transition-all
                                         [&::-moz-range-thumb]:appearance-none 
                                         [&::-moz-range-thumb]:w-4
                                         [&::-moz-range-thumb]:h-4 
                                         [&::-moz-range-thumb]:rounded-full 
                                         [&::-moz-range-thumb]:bg-emerald-400
                                         [&::-moz-range-thumb]:border-2
                                         [&::-moz-range-thumb]:border-emerald-300
                                         [&::-moz-range-thumb]:shadow-lg
                                         [&::-moz-range-thumb]:hover:scale-110
                                         [&::-moz-range-thumb]:transition-all"
                            />
                            <div 
                                className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                style={{ width: `${volume * 100}%` }}
                            />
                        </div>
                    </motion.div>

                    {/* Stop All Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 
                                 px-4 py-2 rounded-xl flex items-center gap-2 text-base font-medium shadow-lg 
                                 transition-all duration-300 border border-rose-400/30"
                        onClick={stopAll}
                    >
                        <RefreshCw size={20} /> Stop All
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default SoothingSoundboard;
