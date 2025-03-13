import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, XCircle } from "lucide-react"; // Remove RefreshCw
import { useNavigate } from "react-router-dom";

const wordList = [
    "OCEAN", "CLOUD", "BLOSSOM", "RIVER", "MOUNTAIN", 
    "MEADOW", "BREEZE", "LANTERN", "GARDEN", "RAINBOW",
    "SILENCE", "MOONLIGHT", "STARLIGHT", "WHISPER", "SUNRISE",
    "SAND", "FEATHER", "ECHO", "LOTUS", "WAVES",
    "TRANQUIL", "ZEN", "HORIZON", "CANDLE", "NEST",
    "SERENE", "FLICKER", "WANDER", "FLOAT", "MELODY"
];

const HangmanGame = () => {
    const [currentWord, setCurrentWord] = useState("");
    const [revealedLetters, setRevealedLetters] = useState([]);
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const newWord = wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(newWord);
        
        // Reveal 2-3 random letters as hints
        const numHints = Math.min(Math.floor(newWord.length / 3), 3);
        const possibleIndices = Array.from({ length: newWord.length }, (_, i) => i);
        const hintIndices = [];
        
        for (let i = 0; i < numHints; i++) {
            const randomIndex = Math.floor(Math.random() * possibleIndices.length);
            hintIndices.push(possibleIndices[randomIndex]);
            possibleIndices.splice(randomIndex, 1);
        }
        
        setRevealedLetters(hintIndices.map(index => ({
            letter: newWord[index],
            index: index
        })));
        
        setGuessedLetters([]);
        setWrongAttempts(0);
        setGameOver(false);
        setGameWon(false);
    };

    const handleGuess = (letter) => {
        if (guessedLetters.includes(letter) || gameOver) return;

        const newGuessedLetters = [...guessedLetters, letter];
        setGuessedLetters(newGuessedLetters);

        if (!currentWord.includes(letter)) {
            const newWrongAttempts = wrongAttempts + 1;
            setWrongAttempts(newWrongAttempts);
            if (newWrongAttempts >= 6) {
                setGameOver(true);
                setGameWon(false);
            }
        } else {
            // Check if all letters are either guessed or revealed as hints
            const isComplete = currentWord.split("").every(char => 
                newGuessedLetters.includes(char) || 
                revealedLetters.some(hint => hint.letter === char)
            );
            
            if (isComplete) {
                setGameWon(true);
                setGameOver(true);
            }
        }
    };

    // Add this new function
    const handlePopupClose = () => {
        setGameOver(false);
        resetGame(); // Reset the game when closing the popup
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-4 left-4 z-50 bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-lg shadow-lg"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Main Container */}
            <div className="w-full max-w-6xl h-[80vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-4 sm:p-6 rounded-2xl shadow-2xl relative z-10 backdrop-blur-lg border border-indigo-500/20">
                <div className="h-full flex flex-col lg:flex-row gap-6">
                    {/* Left Side */}
                    <div className="flex-1 flex flex-col items-center justify-center lg:border-r-2 lg:border-indigo-500/30 lg:pr-6">
                        <h1 className="text-3xl font-bold tracking-wide mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            Hangman
                        </h1>
                        <p className="text-sm sm:text-base text-indigo-200 mb-4 text-center">
                            Guess the word before you run out of attempts!
                        </p>

                        {/* Word Display */}
                        <div className="w-full max-w-md flex flex-wrap justify-center items-center bg-indigo-950/30 px-4 py-4 rounded-xl shadow-lg gap-2 border border-indigo-500/20">
                            {currentWord.split("").map((letter, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    className={`text-2xl sm:text-3xl font-bold border-b-4 px-2 py-1 min-w-[28px] sm:min-w-[36px] text-center
                                        ${revealedLetters.some(hint => hint.index === index)
                                            ? "text-emerald-400 border-emerald-500/50"
                                            : guessedLetters.includes(letter)
                                                ? "text-white border-indigo-500/50"
                                                : "text-white border-indigo-500/50"
                                        }`}
                                >
                                    {revealedLetters.some(hint => hint.index === index) || guessedLetters.includes(letter)
                                        ? letter
                                        : "_"}
                                </motion.span>
                            ))}
                        </div>

                        {/* Score Counter */}
                        <div className="mt-4 w-full max-w-md flex items-center justify-center bg-indigo-950/30 px-4 py-3 rounded-xl text-lg font-semibold shadow-lg border border-indigo-500/20">
                            <Zap size={20} className="text-indigo-400 animate-pulse" />
                            <span className="ml-2 text-indigo-200">Attempts Left: <span className="text-indigo-400">{6 - wrongAttempts}</span></span>
                        </div>
                    </div>

                    {/* Right Side - Keyboard */}
                    <div className="flex-1 flex justify-center items-center p-2 sm:p-4">
                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full max-w-lg">
                            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                                <motion.button
                                    key={letter}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleGuess(letter)}
                                    disabled={guessedLetters.includes(letter) || gameOver}
                                    className={`aspect-square w-full text-base sm:text-lg font-bold rounded-lg transition-all shadow-md border border-indigo-500/20
                                        ${guessedLetters.includes(letter)
                                            ? currentWord.includes(letter)
                                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400/30"
                                                : "bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-400/30"
                                            : "bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white hover:shadow-lg"
                                        } ${gameOver ? "opacity-75" : ""}`}
                                >
                                    {letter}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Over Popup */}
            {gameOver && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`p-6 rounded-lg shadow-xl text-center text-white text-xl sm:text-2xl font-bold w-[90%] max-w-md relative border ${gameWon
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400/30"
                            : "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400/30"
                            }`}
                    >
                        <button
                            className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 rounded-full p-1 text-white transition-all"
                            onClick={handlePopupClose} // Use the new handler instead
                        >
                            <XCircle size={24} />
                        </button>
                        <p>{gameWon ? `🎉 You Won! The word was "${currentWord}".` : `💀 You Lost! The word was "${currentWord}".`}</p>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HangmanGame;
