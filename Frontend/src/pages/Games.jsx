import React from "react";
import { Link } from "react-router-dom";

const gamesList = [
    { name: "Hang Man", path: "/Hang-Man", img: "https://mir-s3-cdn-cf.behance.net/projects/404/db9e21195320515.Y3JvcCw1NzUzLDQ1MDAsMTEyNSww.jpg" },
    { name: "Soothing Soundboard", path: "/Sound-board", img: "https://images.unsplash.com/photo-1506704888326-3b8834edb40a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c291bmR8ZW58MHx8MHx8fDA%3D" },
    { name: "Color & Relax", path: "/Calm-Coloring", img: "https://static.vecteezy.com/system/resources/thumbnails/023/294/542/small_2x/relax-cute-hand-drawn-coloring-pages-for-kids-and-adults-motivational-quotes-text-beautiful-drawings-for-girls-with-patterns-details-coloring-book-with-flowers-and-tropical-plants-vector.jpg" },
    { name: "Mindful Breathing", path: "/Breathing", img: "https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2021/05/breathing-exercise-1620577374.jpg" },
    { name: "Memory Match", path: "/Memory-Match", img: "https://img.freepik.com/free-vector/hand-drawn-memory-game-card_23-2150138543.jpg" },
];

const GameItem = ({ name, path, img }) => (
    <Link to={path} className="flex justify-center">
        <div className="bg-white text-gray-800 shadow-lg rounded-lg p-4 w-full sm:w-72 h-44 flex flex-col items-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <img src={img} alt={name} className="w-full sm:w-64 h-28 object-cover rounded-lg mb-2" />
            <h3 className="text-lg font-semibold text-center">{name}</h3>
        </div>
    </Link>
);

const Games = () => {
    return (
        <div className="px-2 min-h-screen bg-gradient-to-br from-blue-200 to-white text-gray-900 flex flex-col items-center py-10">
            <h2 className="text-3xl font-bold text-blue-700 mb-8">Relax & Play</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gamesList.map((game, index) => (
                    <GameItem key={index} name={game.name} path={game.path} img={game.img} />
                ))}
            </div>
        </div>
    );
};

export default Games;