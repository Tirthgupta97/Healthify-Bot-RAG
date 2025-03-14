import React, { useState, useEffect } from "react";
import { FlipHorizontal, Trophy, RefreshCw, DoorOpen, ArrowLeft, Hourglass, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const emojis = ["🐶", "🐱", "🐭", "🦊", "🐻", "🐼", "🦁", "🐷", "🐸", "🐵", "🦄", "🐯"];

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState("Easy");
  const [gameWon, setGameWon] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    generateCards();
  }, [difficulty]);

  useEffect(() => {
    if (!isGameActive || gameWon) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isGameActive, gameWon]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameWon(true);
      setIsGameActive(false);
    }
  }, [matchedCards]);

  const generateCards = () => {
    let numPairs = difficulty === "Easy" ? 4 : difficulty === "Medium" ? 6 : 8;
    let selectedEmojis = emojis.slice(0, numPairs);
    let cardSet = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false }));

    setCards(cardSet);
    setMatchedCards([]);
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setGameWon(false);
    setIsGameActive(true);
  };

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;

    let newCards = [...cards];
    newCards[index].isFlipped = true;
    setFlippedCards([...flippedCards, index]);

    if (flippedCards.length === 1) {
      setMoves(moves + 1);
      checkMatch(flippedCards[0], index);
    }
  };

  const checkMatch = (index1, index2) => {
    if (cards[index1].emoji === cards[index2].emoji) {
      setMatchedCards([...matchedCards, index1, index2]);
    } else {
      setTimeout(() => {
        let newCards = [...cards];
        newCards[index1].isFlipped = false;
        newCards[index2].isFlipped = false;
        setCards(newCards);
      }, 1000);
    }
    setFlippedCards([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white relative px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-wide mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text mt-10 lg:mt-0">
          Memory Match
        </h1>
        <p className="text-lg text-gray-300">Test your memory by matching pairs of emojis!</p>
      </div>

      {/* Difficulty Selector */}
      <div className="flex gap-4 mb-8">
        {["Easy", "Medium", "Hard"].map((level) => (
          <button
            key={level}
            className={`px-6 py-2 rounded-xl text-lg font-medium transition-all duration-300 border
              ${difficulty === level
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-400/30 shadow-lg shadow-indigo-500/20"
                : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/50"}`}
            onClick={() => setDifficulty(level)}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Game Board */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl bg-gray-900/30 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
        {/* Game Info */}
        <div className="flex justify-between w-full max-w-lg mb-6 px-4">
          <div className="flex items-center gap-2 bg-indigo-900/50 px-4 py-2 rounded-xl border border-indigo-500/20">
            <span className="text-indigo-400"><Hourglass /></span>
            <span className="text-lg font-medium">{time}s</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-xl border border-purple-500/20">
            <span className="text-purple-400"><Target /></span>
            <span className="text-lg font-medium">{moves} moves</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div
          className={`grid gap-4 p-4 bg-gray-900/20 rounded-xl border border-white/5
            ${difficulty === "Easy"
              ? "grid-cols-2 sm:grid-cols-4"
              : difficulty === "Medium"
                ? "grid-cols-3 sm:grid-cols-6"
                : "grid-cols-4 sm:grid-cols-8"}`}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center rounded-xl shadow-lg cursor-pointer transition-all duration-500 transform hover:scale-105
                ${matchedCards.includes(card.id)
                  ? "bg-gradient-to-br from-green-500 to-green-600 border-green-400/30"
                  : "bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500/30"}
                ${card.isFlipped ? "rotate-y-180" : ""}
                border`}
              onClick={() => !card.isFlipped && !matchedCards.includes(card.id) && handleCardClick(index)}
            >
              {card.isFlipped || matchedCards.includes(card.id) ? (
                <span className="text-3xl">{card.emoji}</span>
              ) : (
                <FlipHorizontal size={32} className="text-white/70" />
              )}
            </div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex mt-8 gap-4">
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                       px-6 py-3 rounded-xl flex items-center gap-2 text-lg font-medium shadow-lg 
                       transition-all duration-300 border border-indigo-400/30"
            onClick={generateCards}
          >
            <RefreshCw size={24} /> Restart
          </button>
        </div>
      </div>

      {/* Winning Message */}
      {gameWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl text-center shadow-2xl border border-white/10">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              <Trophy size={32} className="text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text">
                You Won!
              </span>
            </h2>
            <div className="flex gap-6 justify-center mb-6">
              <div className="bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-500/20">
                <Hourglass /> Time: {time}s
              </div>
              <div className="bg-purple-900/30 px-4 py-2 rounded-xl border border-purple-500/20">
                <Target /> Moves: {moves}
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                           px-6 py-3 rounded-xl flex items-center gap-2 text-lg font-medium shadow-lg 
                           transition-all duration-300 border border-green-400/30"
                onClick={generateCards}
              >
                <RefreshCw size={24} /> Play Again
              </button>
              <button
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 
                           px-6 py-3 rounded-xl flex items-center gap-2 text-lg font-medium shadow-lg 
                           transition-all duration-300 border border-rose-400/30"
                onClick={() => navigate(-1)}
              >
                <DoorOpen size={24} /> Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
