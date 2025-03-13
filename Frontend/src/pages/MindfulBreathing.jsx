import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, ArrowLeft, Moon, Sun, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const affirmations = [
    "🧘‍♀️ Breathe in calm, breathe out stress. 🌬️",
    "🌈 You are in control of your breath. 💨",
    "✨ Inhale positivity, exhale negativity. 🌟",
    "💪 You are strong, resilient, and enough. 🌿",
    "🌊 Each breath brings peace and clarity. 🕊️",
    "🍃 Let go of tension with each exhale. 🌸",
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
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -right-10 -top-10 w-72 h-72 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-2000"></div>
                <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-4000"></div>
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
            <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-3xl mx-auto px-4 py-8">
                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-wide mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                        Mindful Breathing 🧘‍♀️
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300">A guided breathing experience for inner peace 🌈</p>
                </motion.div>

                {/* Breathing Circle */}
                <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 mb-6">
                    {/* Animated Circles */}
                    <motion.div
                        animate={{
                            scale: breathingPhase === "Inhale" || breathingPhase === "Hold" ? 1.3 : 0.9,
                            opacity: breathingPhase === "Relax" ? 0.3 : 0.6,
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-8 border-purple-400/30"
                    />

                    {/* Inner Circle */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 
                                 backdrop-blur-md flex items-center justify-center border border-white/20"
                    >
                        <div className="flex flex-col items-center gap-2">
                            {breathingPhase === "Inhale" && <div className="text-2xl">🫁</div>}
                            {breathingPhase === "Hold" && <div className="text-2xl">⏸️</div>}
                            {breathingPhase === "Exhale" && <div className="text-2xl">💨</div>}
                            {breathingPhase === "Ready" && <div className="text-2xl">🧘‍♀️</div>}
                            {breathingPhase === "Relax" && <div className="text-2xl">😌</div>}
                            <div className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                                {breathingPhase}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Affirmation */}
                <motion.p
                    key={affirmation}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg sm:text-xl text-center italic text-gray-300 mb-6 px-4 min-h-[3rem] tracking-wide"
                >
                    {affirmation}
                </motion.p>

                {/* Controls */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center gap-3 text-base sm:text-lg font-medium shadow-lg transition-all 
                              duration-300 border backdrop-blur-sm ${
                                isPlaying
                                    ? "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30"
                                    : "bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
                              }`}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    {isPlaying ? "Pause 🛑" : "Start ▶️"}
                </motion.button>
            </div>
        </div>
    );
};

export default MindfulBreathing;
