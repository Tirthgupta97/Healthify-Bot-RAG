import React, { useState } from "react";
import { Play, Pause, Volume2, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// List of relaxing sounds
const sounds = [
    { id: 1, name: "Rain", src: "/sounds/rain.mp3", emoji: "🌧️" },
    { id: 2, name: "Ocean", src: "/sounds/ocean.mp3", emoji: "🌊" },
    { id: 3, name: "Forest", src: "/sounds/forest.mp3", emoji: "🌲" },
    { id: 4, name: "Fireplace", src: "/sounds/fireplace.mp3", emoji: "🔥" },
    { id: 5, name: "Wind Chimes", src: "/sounds/windchimes.mp3", emoji: "🎐" },
];

const SoothingSoundboard = () => {
    const [playing, setPlaying] = useState({});
    const [volume, setVolume] = useState(0.5);
    const navigate = useNavigate();

    // Handle Play/Pause Toggle
    const togglePlay = (id, src) => {
        if (playing[id]) {
            playing[id].pause();
            setPlaying((prev) => ({ ...prev, [id]: null }));
        } else {
            const audio = new Audio(src);
            audio.loop = true;
            audio.volume = volume;
            audio.play();
            setPlaying((prev) => ({ ...prev, [id]: audio }));
        }
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
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-green-900 to-green-600 text-white relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-5 left-5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-wide mb-2">Soothing Soundboard</h1>
            <p className="text-lg text-gray-300 mb-6">Relax with nature’s sounds 🌿🎶</p>

            {/* Sound Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {sounds.map((sound) => (
                    <div
                        key={sound.id}
                        className={`relative w-32 h-32 sm:w-40 sm:h-40 flex flex-col items-center justify-center rounded-lg shadow-md cursor-pointer transition-all duration-500
                        ${playing[sound.id] ? "bg-green-500 opacity-80" : "bg-green-800 hover:scale-105"}`}
                        onClick={() => togglePlay(sound.id, sound.src)}
                    >
                        <span className="text-4xl">{sound.emoji}</span>
                        <p className="text-lg font-medium mt-2">{sound.name}</p>
                        {playing[sound.id] ? (
                            <Pause size={24} className="absolute bottom-2 text-white opacity-80" />
                        ) : (
                            <Play size={24} className="absolute bottom-2 text-white opacity-80" />
                        )}
                    </div>
                ))}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 mt-6">
                <Volume2 size={24} className="text-gray-300" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-40 h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Stop All Button */}
            <button
                className="mt-6 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300 cursor-pointer"
                onClick={stopAll}
            >
                <RefreshCw size={24} /> Stop All
            </button>
        </div>
    );
};

export default SoothingSoundboard;
