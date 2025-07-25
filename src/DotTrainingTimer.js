import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const DotTrainingTimer = () => {
  const initialDuration = 2 * 60; // 2 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize AudioContext
  useEffect(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch (e) {
      console.error("Web Audio API not supported or failed to initialize:", e);
    }
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Function to play a simple beep sound
  const playBeep = (frequency = 440, duration = 0.1) => {
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      const now = audioContextRef.current.currentTime;
      const gainNode = audioContextRef.current.createGain();
      gainNode.connect(audioContextRef.current.destination);
      gainNode.gain.setValueAtTime(0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const tempOscillator = audioContextRef.current.createOscillator();
      tempOscillator.type = 'sine';
      tempOscillator.frequency.setValueAtTime(frequency, now);
      tempOscillator.connect(gainNode);

      tempOscillator.start(now);
      tempOscillator.stop(now + duration);
    } else {
      console.warn("AudioContext not running or not supported. Cannot play beep.");
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
      playBeep(1000); // Higher pitch for completion
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleStartPause = () => {
    if (!isRunning && timeLeft === 0) { // If finished, reset before starting
      handleReset();
    }
    setIsRunning(!isRunning);
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialDuration);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercentage = ((initialDuration - timeLeft) / initialDuration) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border border-amber-200">
      <h3 className="text-xl font-semibold text-amber-800 mb-4">Focused Gaze Training</h3>
      <p className="text-base mb-4 text-center">Maintain uninterrupted focus on an object for the duration.</p>

      <div className="relative w-48 h-48 rounded-full bg-amber-100 flex items-center justify-center mb-6 overflow-hidden shadow-inner">
        {/* Progress circle background */}
        <div
          className="absolute inset-0 bg-amber-300 transform origin-bottom transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleY(${1 - (timeLeft / initialDuration)})` }}
        ></div>
        {/* Text overlay */}
        <div className="relative z-10 flex flex-col items-center text-amber-900">
          <p className="text-3xl font-bold mb-2">Time Left:</p>
          <p className="text-5xl font-extrabold">{displayTime}</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleStartPause}
          className="flex items-center px-6 py-3 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {isRunning ? "Pause" : (timeLeft === 0 ? "Restart" : "Start")}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center px-6 py-3 bg-neutral-200 text-neutral-800 rounded-full shadow-lg hover:bg-neutral-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>

      {timeLeft === 0 && (
        <p className="text-lg font-semibold text-green-700 mt-4">Exercise Complete! Well done.</p>
      )}

      {/* Overall Progress Bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-4">
        <div
          className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-neutral-600 mt-2">{Math.round(progressPercentage)}% Complete</p>
    </div>
  );
};

export default DotTrainingTimer;

