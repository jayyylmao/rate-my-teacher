"use client";

import { useState } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [showTime, setShowTime] = useState(false);

  const handleShowTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString());
    setShowTime(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg animate-fade-in">
          Hello World!
        </h1>
        <p className="text-2xl text-white/90">
          Welcome to yoaaaaaur Next.js app deployed on Vercel
        </p>

        <button
          onClick={handleShowTime}
          className="mt-4 px-8 py-3 bg-white text-blue-600 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:bg-blue-50"
        >
          Show Current Time
        </button>

        {showTime && (
          <div className="mt-2 rounded-lg bg-white/20 backdrop-blur-sm px-8 py-4 animate-slide-up">
            <p className="text-3xl font-bold text-white">
              {currentTime}
            </p>
          </div>
        )}

        <div className="mt-4 rounded-lg bg-white/10 backdrop-blur-sm px-6 py-3">
          <p className="text-white/80 text-sm">
            Built with Next.js 15 + TypeScript + Tailwind CSS
          </p>
        </div>
      </main>
    </div>
  );
}
