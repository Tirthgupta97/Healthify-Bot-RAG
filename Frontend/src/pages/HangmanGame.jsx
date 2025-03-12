import React, { useState, useEffect } from "react";
import { RefreshCw, ArrowLeft, Zap, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const words = ["REACT", "JAVASCRIPT", "PYTHON", "CODING", "DEVELOPER", "COMPUTER", "ALGORITHM", "HANGMAN", "ARTIFICIALINTELLIGENCE"];

const HangmanGame = () => {
    const [word, setWord] = useState("");
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const newWord = words[Math.floor(Math.random() * words.length)];
        setWord(newWord);
        setGuessedLetters([]);
        setWrongAttempts(0);
        setGameOver(false);
        setGameWon(false);
    };

    const handleGuess = (letter) => {
        if (guessedLetters.includes(letter) || gameOver) return;

        const newGuessedLetters = [...guessedLetters, letter];
        setGuessedLetters(newGuessedLetters);

        if (!word.includes(letter)) {
            const newWrongAttempts = wrongAttempts + 1;
            setWrongAttempts(newWrongAttempts);
            if (newWrongAttempts >= 6) {
                setGameOver(true);
                setGameWon(false);
            }
        } else {
            const wordCompleted = word.split("").every((letter) => newGuessedLetters.includes(letter));
            if (wordCompleted) {
                setGameWon(true);
                setGameOver(true);
            }
        }
    };

    return (
        <div className={`flex items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white relative transition-all`}>
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-lg"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Game Container */}
            <div className={`flex w-[90%] max-w-5xl bg-gray-900 p-8 rounded-lg shadow-xl relative z-10 ${gameOver ? "blur-sm" : ""}`}>
                {/* Left Side (Word + Score) */}
                <div className="flex flex-col items-center w-1/2 border-r-2 border-gray-700 pr-6">
                    {/* Title */}
                    <h1 className="text-4xl font-bold tracking-wide mb-2">🎭 Hangman</h1>
                    <p className="text-lg text-gray-300 mb-6">Guess the word before you run out of attempts!</p>

                    {/* Word Display (Auto Adjusting) */}
                    <div className="flex flex-wrap justify-center items-center bg-gray-800 px-6 py-3 rounded-lg shadow-lg max-w-full">
                        {word.split("").map((letter, index) => (
                            <span key={index} className="text-3xl font-bold border-b-4 px-3 py-2">
                                {guessedLetters.includes(letter) ? letter : "_"}
                            </span>
                        ))}
                    </div>

                    {/* Score Counter */}
                    <div className="mt-5 flex items-center bg-gray-800 px-5 py-3 rounded-lg text-xl font-semibold shadow-lg">
                        <Zap size={24} className="text-yellow-400" />
                        <span className="ml-3">Attempts Left: {6 - wrongAttempts}</span>
                    </div>

                    {/* Restart Button */}
                    <button
                        className="mt-6 bg-yellow-500 hover:bg-yellow-600 px-5 py-3 rounded-lg flex items-center gap-3 text-xl font-medium shadow-lg transition-all"
                        onClick={resetGame}
                    >
                        <RefreshCw size={24} /> Restart
                    </button>
                </div>

                {/* Right Side (Letter Buttons) */}
                <div className="w-1/2 flex flex-wrap justify-center items-center p-6">
                    <div className="grid grid-cols-7 gap-3">
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                            <button
                                key={letter}
                                onClick={() => handleGuess(letter)}
                                disabled={guessedLetters.includes(letter) || gameOver}
                                className={`w-12 h-12 text-xl font-bold rounded-lg transition-all shadow-md ${
                                    guessedLetters.includes(letter)
                                        ? word.includes(letter)
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ✅ FIXED: Popup Box Now Appears Properly */}
            {gameOver && (
                <div className="absolute inset-0 flex justify-center items-center backdrop-blur-lg bg-opacity-50 z-50">
                    <div className={`p-6 rounded-lg shadow-xl text-center text-white text-2xl font-bold w-96 relative ${gameWon ? "bg-green-500" : "bg-red-500"}`}>
                        <button
                            className="absolute top-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full text-black"
                            onClick={() => setGameOver(false)}
                        >
                            <XCircle size={24} />
                        </button>
                        <p>{gameWon ? `🎉 You Won! The word was "${word}".` : `💀 You Lost! The word was "${word}".`}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HangmanGame;
