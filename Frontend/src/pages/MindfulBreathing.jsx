import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const affirmations = [
    "Breathe in calm, breathe out stress.",
    "You are in control of your breath.",
    "Inhale positivity, exhale negativity.",
    "You are strong, resilient, and enough.",
];

const MindfulBreathing = () => {
    const [breathingPhase, setBreathingPhase] = useState("Ready");
    const [isPlaying, setIsPlaying] = useState(false);
    const [affirmation, setAffirmation] = useState("");
    const navigate = useNavigate();
    const timeouts = useRef([]); // Store timeout IDs to clear them when needed

    useEffect(() => {
        if (!isPlaying) {
            // Clear all timeouts when paused
            timeouts.current.forEach(clearTimeout);
            timeouts.current = [];
            setBreathingPhase("Ready");
            setAffirmation("");
            return;
        }

        let index = 0;

        const cycle = () => {
            setBreathingPhase("Inhale");
            setAffirmation(affirmations[index % affirmations.length]);

            timeouts.current.push(setTimeout(() => setBreathingPhase("Hold"), 4000));
            timeouts.current.push(setTimeout(() => setBreathingPhase("Exhale"), 6000));
            timeouts.current.push(setTimeout(() => setBreathingPhase("Relax"), 9000));

            index++;
        };

        cycle();
        const intervalId = setInterval(cycle, 12000);
        timeouts.current.push(intervalId);

        return () => {
            timeouts.current.forEach(clearTimeout);
            clearInterval(intervalId);
        };
    }, [isPlaying]);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-5 left-5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-wide mb-2">Mindful Breathing</h1>
            <p className="text-lg text-gray-300 mb-6">A guided breathing experience for relaxation.</p>

            {/* Breathing Circle */}
            <div className="relative flex items-center justify-center w-64 h-64">
                {/* Animated Outer Breathing Circle */}
                <div
                    className={`absolute w-44 h-44 rounded-full border-8 border-white transition-all duration-[4s] ease-in-out ${
                        !isPlaying
                            ? "scale-100 opacity-100"
                            : breathingPhase === "Inhale"
                            ? "scale-150 opacity-80"
                            : breathingPhase === "Hold"
                            ? "scale-150 opacity-80"
                            : breathingPhase === "Exhale"
                            ? "scale-100 opacity-100"
                            : ""
                    }`}
                ></div>

                {/* Inner Circle */}
                <div className="relative w-40 h-40 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                    <div className="text-2xl font-semibold">{breathingPhase}</div>
                </div>
            </div>

            {/* Affirmation */}
            <p className="text-xl mt-6 text-center italic text-gray-300">{affirmation}</p>

            {/* Start/Pause Button */}
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="mt-8 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
            >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />} {isPlaying ? "Pause" : "Start"}
            </button>
        </div>
    );
};

export default MindfulBreathing;
