import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import VideoBackground from '../components/SoundBoardComponent/VideoBackground';

// List of relaxing sounds
const sounds = [
    { id: 1, name: "Rain", src: "/sounds/rain.mp3", emoji: "🌧️", videoSrc: "/videos/rain.mp4" },
    { id: 2, name: "Ocean", src: "/sounds/ocean.mp3", emoji: "🌊", videoSrc: "/videos/ocean.mp4" },
    { id: 3, name: "Forest", src: "/sounds/forest.mp3", emoji: "🌲", videoSrc: "/videos/forest.mp4" },
    { id: 4, name: "Fireplace", src: "/sounds/fireplace.mp3", emoji: "🔥", videoSrc: "/videos/fireplace.mp4" },
    { id: 5, name: "Wind Chimes", src: "/sounds/windchimes.mp3", emoji: "🎐", videoSrc: "/videos/windchimes.mp4" },
];

const SoothingSoundboard = () => {
    const [playing, setPlaying] = useState({});
    const [volume, setVolume] = useState(0.5);
    const [activeSound, setActiveSound] = useState(null);
    const navigate = useNavigate();

    // Cleanup function to stop all sounds when component unmounts
    useEffect(() => {
        return () => {
            // Stop all audio when navigating away
            Object.values(playing).forEach((audio) => {
                if (audio) audio.pause();
            });
        };
    }, [playing]);

    // Handle Play/Pause Toggle
    const togglePlay = (sound) => {
        // If the clicked sound is already playing, pause it
        if (playing[sound.id]) {
            playing[sound.id].pause();
            setPlaying((prev) => ({ ...prev, [sound.id]: null }));
            setActiveSound(null);
            return;
        }

        // Stop any currently playing sounds
        Object.values(playing).forEach((audio) => {
            if (audio) audio.pause();
        });

        // Play the new sound
        const audio = new Audio(sound.src);
        audio.loop = true;
        audio.volume = volume;
        audio.play();

        // Update state
        setPlaying({ [sound.id]: audio });
        setActiveSound(sound);
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
        setActiveSound(null);
    };

    return (
        <div className="h-screen w-full relative overflow-hidden">
            {/* Video Background - Now shows gradient when no video is playing */}
            <VideoBackground
                videoSrc={activeSound?.videoSrc}
                isPlaying={!!activeSound}
            />

            {/* Add a subtle overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/30 z-[1]" />

            {/* Back Button - increase z-index */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-[60] bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl 
                          flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10"
            >
                <ArrowLeft size={20} /> Back
            </motion.button>

            {/* Main Content - increase z-index */}
            <div className="relative flex flex-col items-center justify-center z-[20] w-full max-w-4xl mx-auto h-full py-8">
                {/* Title & Description - Hidden when video is playing */}
                {!activeSound && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6 absolute top-20"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-wide mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text py-1">
                            Soothing Soundboard
                        </h1>
                        <p className="text-base sm:text-lg text-gray-300">
                            Relax with nature's sounds 🌿🎶
                        </p>
                    </motion.div>
                )}

                {/* Sound Buttons - Fixed on right side */}
                <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                    {sounds.map((sound) => (
                        <motion.button
                            key={sound.id}
                            onClick={() => togglePlay(sound)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 rounded-full backdrop-blur-sm 
                                ${playing[sound.id]
                                    ? 'bg-emerald-500/50 text-white'
                                    : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                            <span className="text-2xl">{sound.emoji}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Volume Control - Appears at bottom-right */}
                    {activeSound && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="fixed right-8 top-10 flex items-center gap-3 bg-white/5 px-4 py-2 
                   rounded-xl backdrop-blur-sm border border-white/10 z-50"
                        >
                            <Volume2 size={20} className="text-emerald-400" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-32 h-2 bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-full 
                       appearance-none cursor-pointer"
                            />
                        </motion.div>
                    )}

                    {/* Stop All Button - Visible when a sound or video is playing */}
                    {activeSound && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="fixed right-8 bottom-8 bg-gradient-to-r from-rose-500 to-red-500 
                 hover:from-rose-600 hover:to-red-600 px-4 py-3 rounded-xl flex items-center 
                 gap-2 text-base font-medium text-white shadow-lg transition-all duration-300 
                 border border-rose-400/30 z-50"
                            onClick={stopAll}
                        >
                            <RefreshCw size={20} /> Stop All
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SoothingSoundboard;