"use client";

import React, { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import StartGame from "@/backend/Game";
import Leaderboard from "@/components/Leaderboard";
import { useStore } from "@/context";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const { scene, players, setScene } = useStore()

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null)


  useEffect(() => {
    if (canvasRef.current) {
      const { devicePixelRatio } = window;
      new StartGame(canvasRef.current, devicePixelRatio);
    }
  }, []);

  const handleUsernameFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const username = event.currentTarget.usernameInput.value;
    socket.emit('initGame', {
      width: width,
      height: height,
      username: username
    })
    setScene('game')
  }

  return (
    <>
    <p>Status: { isConnected ? "connected" : "disconnected" }</p>
    <div className="relative flex items-center justify-center">
      <div>
        <Leaderboard players={players} />
        <canvas ref={canvasRef} width={1024} height={576} style={{ backgroundImage: 'url(img/webb-dark.png)' }} />
        <div className="flex items-center justify-center absolute top-0 left-0 right-0 bottom-0">
          {scene === 'login' && (
            <form id="usernameForm" onSubmit={handleUsernameFormSubmit}>
            <input id="usernameInput" type="text" placeholder="Username" className="p-3 rounded-lg border-none bg-gray-700 text-gray-300" aria-label="Username" />
            <div className="text-center mt-2">
              <button className="px-5 py-2 rounded-lg border-none bg-gradient-to-r from-blue-400 to-blue-600 text-white cursor-pointer">
                Start!
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
