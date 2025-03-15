import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Undo2, X, Trophy, Frown, Crown, ArrowUp, ArrowDown, ArrowRight, } from "lucide-react";

// Generate initial empty grid
const generateGrid = () => Array(4).fill().map(() => Array(4).fill(0));

// Add random tile (2 or 4) to empty cell
const addRandomTile = (grid) => {
    const emptyCells = [];
    grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell === 0) emptyCells.push([i, j]);
        });
    });

    if (emptyCells.length > 0) {
        const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newGrid = grid.map(row => [...row]);
        newGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    }
    return grid;
};

// Move and merge tiles in specified direction
const moveTiles = (grid, direction) => {
    let newGrid = grid.map(row => [...row]);
    let moved = false;

    const moveLeft = (grid) => {
        for (let i = 0; i < 4; i++) {
            let row = grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            while (row.length < 4) row.push(0);
            if (row.join(',') !== grid[i].join(',')) moved = true;
            grid[i] = row;
        }
        return grid;
    };

    const rotate = (grid) => {
        let newGrid = Array(4).fill().map(() => Array(4).fill(0));
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                newGrid[i][j] = grid[j][3 - i];
            }
        }
        return newGrid;
    };

    switch (direction) {
        case 'left':
            newGrid = moveLeft(newGrid);
            break;
        case 'right':
            newGrid = rotate(rotate(moveLeft(rotate(rotate(newGrid)))));
            break;
        case 'up':
            newGrid = rotate(rotate(rotate(moveLeft(rotate(newGrid)))));
            break;
        case 'down':
            newGrid = rotate(moveLeft(rotate(rotate(rotate(newGrid)))));
            break;
        default:
            break;
    }

    return moved ? addRandomTile(newGrid) : grid;
};

// Check game status
const checkGameStatus = (grid) => {
    // Check for 2048 tile
    for (let row of grid) {
        if (row.includes(2048)) return "win";
    }

    // Check for empty cells
    for (let row of grid) {
        if (row.includes(0)) return null;
    }

    // Check for possible moves
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                (i < 3 && grid[i][j] === grid[i + 1][j]) ||
                (j < 3 && grid[i][j] === grid[i][j + 1])
            ) {
                return null;
            }
        }
    }

    return "lose";
};

// Get tile color based on value
const getTileColor = (value) => {
    const colors = {
        2: 'from-blue-300 to-blue-400',
        4: 'from-green-300 to-green-400',
        8: 'from-yellow-300 to-yellow-400',
        16: 'from-orange-300 to-orange-400',
        32: 'from-red-300 to-red-400',
        64: 'from-pink-300 to-pink-400',
        128: 'from-purple-300 to-purple-400',
        256: 'from-indigo-300 to-indigo-400',
        512: 'from-cyan-300 to-cyan-400',
        1024: 'from-teal-300 to-teal-400',
        2048: 'from-emerald-300 to-emerald-400'
    };
    return colors[value] || 'from-gray-300 to-gray-400';
};

const Game2048 = () => {
    const navigate = useNavigate();
    const [grid, setGrid] = useState(null);
    const [prevGrid, setPrevGrid] = useState(null);
    const [gameStatus, setGameStatus] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [score, setScore] = useState(0);
    const [backgroundMusic] = useState(new Audio("/music/game-music.mp3"));
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    
    // Add refs for touch gesture handling
    const touchStartRef = useRef({ x: 0, y: 0 });
    const gridRef = useRef(null);

    // Initialize game
    useEffect(() => {
        const initialGrid = addRandomTile(generateGrid());
        setGrid(initialGrid);
    }, []);

    // Handle background music
    useEffect(() => {
        backgroundMusic.loop = true;
        return () => {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        };
    }, [backgroundMusic]);

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!grid || gameStatus) return;

            const directions = {
                ArrowLeft: 'left',
                ArrowRight: 'right',
                ArrowUp: 'up',
                ArrowDown: 'down'
            };

            if (directions[e.key]) {
                e.preventDefault();
                const direction = directions[e.key];
                handleMove(direction);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [grid, gameStatus]);

    // Handle touch events for swipe gestures
    useEffect(() => {
        const gridElement = gridRef.current;
        if (!gridElement || !grid || gameStatus) return;
        
        const handleTouchStart = (e) => {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        };
        
        const handleTouchEnd = (e) => {
            if (!touchStartRef.current) return;
            
            const touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };
            
            const dx = touchEnd.x - touchStartRef.current.x;
            const dy = touchEnd.y - touchStartRef.current.y;
            
            // Determine swipe direction based on which axis had the larger movement
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (Math.abs(dx) > 30) { // Minimum swipe distance threshold
                    if (dx > 0) {
                        handleMove('right');
                    } else {
                        handleMove('left');
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(dy) > 30) { // Minimum swipe distance threshold
                    if (dy > 0) {
                        handleMove('down');
                    } else {
                        handleMove('up');
                    }
                }
            }
        };
        
        gridElement.addEventListener('touchstart', handleTouchStart);
        gridElement.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            gridElement.removeEventListener('touchstart', handleTouchStart);
            gridElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, [grid, gameStatus]);

    const handleMove = (direction) => {
        setPrevGrid([...grid.map(row => [...row])]);
        const newGrid = moveTiles(grid, direction);

        if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
            setGrid(newGrid);
            updateScore(newGrid);
            const status = checkGameStatus(newGrid);
            if (status) {
                setGameStatus(status);
                setShowPopup(true);
            }
        }
    };

    const updateScore = (newGrid) => {
        const newScore = newGrid.flat().reduce((sum, value) => sum + value, 0);
        setScore(newScore);
    };

    const toggleMusic = () => {
        if (isMusicPlaying) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play();
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    if (!grid) return null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -right-10 -top-10 w-72 h-72 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative flex flex-col items-center justify-center min-h-screen z-10 px-4 py-8">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl 
                             flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} /> Back
                </motion.button>

                {/* Game Title & Score */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-wide mb-2 flex items-center justify-center gap-3">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            2048
                        </span>
                        <Crown className="text-yellow-400" size={32} />
                    </h1>
                    <p className="text-2xl text-white font-bold">Score: {score}</p>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-20">
                    {/* Game Grid - Add ref for touch events */}
                    <motion.div
                        ref={gridRef}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="grid grid-cols-4 gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg"
                    >
                        {grid.map((row, i) =>
                            row.map((value, j) => (
                                <motion.div
                                    key={`${i}-${j}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-lg md:text-xl 
                                         font-bold rounded-xl shadow-inner transition-all duration-300
                                         ${value ? `bg-gradient-to-br ${getTileColor(value)}` : 'bg-white/5'}`}
                                >
                                    {value > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-gray-900"
                                        >
                                            {value}
                                        </motion.span>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </motion.div>

                    {/* Controls */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div></div>
                            <button
                                onClick={() => handleMove('up')}
                                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <ArrowUp size={24} className="text-white" />
                            </button>
                            <div></div>
                            <button
                                onClick={() => handleMove('left')}
                                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <ArrowLeft size={24} className="text-white" />
                            </button>
                            <button
                                onClick={() => handleMove('down')}
                                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <ArrowDown size={24} className="text-white" />
                            </button>
                            <button
                                onClick={() => handleMove('right')}
                                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <ArrowRight size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-white 
                                     shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-2"
                                onClick={() => {
                                    setGrid(addRandomTile(generateGrid()));
                                    setScore(0);
                                }}
                            >
                                <RotateCcw size={20} /> Restart
                            </motion.button>
                            {prevGrid && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-white 
                                         shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-2"
                                    onClick={() => setGrid(prevGrid)}
                                >
                                    <Undo2 size={20} /> Undo
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Add swipe instructions for mobile users */}
                <div className="mt-4 text-white/70 text-sm">
                    <p>Swipe on the grid to move tiles</p>
                </div>
            </div>

            {/* Game Over/Win Popup */}
            {showPopup && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-lg text-center relative max-w-sm mx-4"
                    >
                        <button
                            className="absolute top-4 right-4 text-white/60 hover:text-white/90 transition-colors"
                            onClick={() => setShowPopup(false)}
                        >
                            <X size={24} />
                        </button>
                        <div className="flex items-center justify-center mb-4">
                            {gameStatus === "win" ? (
                                <Trophy size={48} className="text-yellow-400" />
                            ) : (
                                <Frown size={48} className="text-red-400" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {gameStatus === "win" ? "Congratulations!" : "Game Over"}
                        </h2>
                        <p className="text-gray-300 mb-4">Final Score: {score}</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-xl text-white 
                                     shadow-lg font-medium"
                            onClick={() => {
                                setGrid(addRandomTile(generateGrid()));
                                setScore(0);
                                setShowPopup(false);
                                setGameStatus(null);
                            }}
                        >
                            Play Again
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Game2048;