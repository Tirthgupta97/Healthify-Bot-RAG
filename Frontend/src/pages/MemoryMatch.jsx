import React, { useState, useEffect } from "react";
import { FlipHorizontal, Trophy, RefreshCw, DoorOpen, Lightbulb, ArrowLeft } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Title */}
      <h1 className="text-4xl font-bold tracking-wide mb-2">Memory Match</h1>
      <p className="text-lg text-gray-300 mb-6">Test your memory by matching pairs of emojis!</p>

      {/* Difficulty Selector */}
      <div className="flex gap-4 mb-6">
        {["Easy", "Medium", "Hard"].map((level) => (
          <button
            key={level}
            className={`px-6 py-2 rounded-lg text-lg font-medium transition-all duration-300
                        ${difficulty === level ? "bg-yellow-500 text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
            onClick={() => setDifficulty(level)}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Game Board */}
      <div className="relative flex flex-col items-center justify-center w-full">
        {/* Game Info */}
        <div className="flex justify-between w-full text-lg text-gray-300 mb-4 max-w-lg">
          <div>⏳ Time: {time}s</div>
          <div>Moves: {moves}</div>
        </div>

        {/* Cards Grid */}
        <div
          className={`grid gap-4 ${difficulty === "Easy" ? "grid-cols-4" : difficulty === "Medium" ? "grid-cols-6" : "grid-cols-8"
            }`}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center rounded-lg shadow-md cursor-pointer transition-all duration-500
                            ${matchedCards.includes(card.id) ? "bg-green-500 opacity-70" : "bg-blue-800 hover:scale-105"}
                            ${card.isFlipped ? "rotate-y-180" : ""}`}
              onClick={() => !card.isFlipped && !matchedCards.includes(card.id) && handleCardClick(index)}
            >
              {card.isFlipped || matchedCards.includes(card.id) ? (
                <span className="text-3xl text-white">{card.emoji}</span>
              ) : (
                <FlipHorizontal size={32} className="text-white opacity-70" />
              )}
            </div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex mt-6 gap-4">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
            onClick={generateCards}
          >
            <RefreshCw size={24} /> Restart
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
            onClick={() => navigate(-1)}
          >
            <DoorOpen size={24} /> Exit
          </button>
        </div>
      </div>

      {/* Winning Message */}
      {gameWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 p-8 rounded-lg text-center shadow-lg">
            <h2 className="text-4xl font-bold text-green-400 mb-4 flex items-center justify-center gap-2">
              <Trophy size={32} /> You Won!
            </h2>
            <p className="text-lg mb-4">⏳ Time: {time}s | 🎯 Moves: {moves}</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
                onClick={generateCards}
              >
                <RefreshCw size={24} /> Play Again
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg transition-all duration-300"
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
