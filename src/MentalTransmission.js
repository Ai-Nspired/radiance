import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const MentalTransmission = () => {
  const [intention, setIntention] = useState('');
  const [isInputValid, setIsInputValid] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0); // 0: Inhale, 1: Hold/Intention, 2: Exhale
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreathingComplete, setIsBreathingComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  const totalBreathingCycles = 7;
  const phases = [
    { name: "Inhale", duration: 8, text: "I claim this energy" },
    { name: "Hold Intention", duration: 8, text: "Focus on your intention" },
    { name: "Exhale", duration: 8, text: "I radiate purpose" }
  ];

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

  // Handle intention input
  const handleIntentionChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(Boolean); // Split by whitespace, remove empty strings
    setIntention(text);
    setIsInputValid(words.length > 0 && words.length <= 5);
  };

  // Initialize timer state when starting or resetting
  useEffect(() => {
    if (!isRunning && !isBreathingComplete) {
      setTimeLeft(phases[0].duration); // Set initial time for first phase
    }
  }, [isRunning, isBreathingComplete]);


  // Main timer logic for breathing
  useEffect(() => {
    if (isRunning && currentCycle < totalBreathingCycles) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            playBeep(880); // Higher pitch beep at phase end

            const nextPhaseIdx = (currentPhaseIndex + 1) % phases.length;
            if (nextPhaseIdx === 0) { // Completed a full phase cycle
              const nextCycle = currentCycle + 1;
              if (nextCycle >= totalBreathingCycles) {
                setIsRunning(false);
                setIsBreathingComplete(true);
                clearInterval(timerRef.current);
                return 0;
              }
              setCurrentCycle(nextCycle);
            }
            setCurrentPhaseIndex(nextPhaseIdx);
            return phases[nextPhaseIdx].duration;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, currentCycle, currentPhaseIndex, phases, totalBreathingCycles]);

  // Trigger animation after breathing is complete
  useEffect(() => {
    if (isBreathingComplete) {
      const animationTimeout = setTimeout(() => {
        setIsAnimating(true); // Start the glow animation
      }, 500); // Small delay before animation starts
      return () => clearTimeout(animationTimeout);
    }
  }, [isBreathingComplete]);


  const handleStart = () => {
    if (isInputValid) {
      setIsRunning(true);
      setIsBreathingComplete(false);
      setIsAnimating(false);
      setCurrentCycle(0);
      setCurrentPhaseIndex(0);
      setTimeLeft(phases[0].duration); // Reset time for first phase
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreathingComplete(false);
    setIsAnimating(false);
    setCurrentCycle(0);
    setCurrentPhaseIndex(0);
    setTimeLeft(phases[0].duration); // Reset to first phase duration
    setIntention('');
    setIsInputValid(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const currentPhase = phases[currentPhaseIndex];
  const progressPercentage = (timeLeft / currentPhase.duration) * 100;
  const totalProgress = ((currentCycle * phases.length + currentPhaseIndex) / (totalBreathingCycles * phases.length)) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border border-amber-200">
      <h3 className="text-xl font-semibold text-amber-800 mb-4">Mental Sending Protocol</h3>

      {!isRunning && !isBreathingComplete && (
        <div className="w-full max-w-md mb-6">
          <label htmlFor="intention-input" className="block text-sm font-medium text-neutral-700 mb-2">
            Write your intention (5 words or less):
          </label>
          <input
            id="intention-input"
            type="text"
            value={intention}
            onChange={handleIntentionChange}
            maxLength={50} // Arbitrary max length, 5 words is typically less
            className={`
              w-full p-3 border rounded-md text-lg text-center
              focus:outline-none focus:ring-2 focus:ring-amber-500
              ${!isInputValid && intention.length > 0 ? 'border-red-500' : 'border-neutral-300'}
            `}
            placeholder="e.g., peace, abundance, clarity, strength"
            disabled={isRunning || isBreathingComplete}
          />
          <p className={`text-sm mt-1 ${isInputValid ? 'text-neutral-500' : 'text-red-500'}`}>
            {intention.trim().split(/\s+/).filter(Boolean).length} / 5 words
          </p>
        </div>
      )}

      {(isRunning || isBreathingComplete) && (
        <div className="flex flex-col items-center mb-6">
          <p className="text-sm font-medium opacity-70 mb-2">Cycle {currentCycle + 1} of {totalBreathingCycles}</p>
          <p className="text-3xl font-bold mb-2">{currentPhase.name}</p>
          <p className="text-5xl font-extrabold text-amber-900">{timeLeft}</p>
          <p className="text-base italic mt-2 text-center max-w-[80%] text-neutral-700">{currentPhase.text}</p>

          {currentPhaseIndex === 1 && ( // Display intention during "Hold Intention" phase
            <p className={`
              text-2xl sm:text-3xl font-bold mt-4 p-2 rounded-md
              transition-all duration-1000 ease-in-out
              ${isAnimating ? 'text-white bg-amber-500 shadow-amber-glow' : 'text-amber-900 bg-amber-100'}
            `}
            style={{
              textShadow: isAnimating ? '0 0 8px #fcd34d, 0 0 15px #fcd34d' : 'none',
              boxShadow: isAnimating ? '0 0 20px rgba(252, 211, 77, 0.7)' : 'none',
              transition: 'text-shadow 1s ease-in-out, box-shadow 1s ease-in-out, background-color 1s ease-in-out'
            }}>
              {intention}
            </p>
          )}
        </div>
      )}

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleStart}
          disabled={!isInputValid || isRunning || isBreathingComplete}
          className={`
            flex items-center px-6 py-3 rounded-full shadow-lg transition-all duration-200
            ${isInputValid && !isRunning && !isBreathingComplete
              ? 'bg-amber-700 text-white hover:bg-amber-800 focus:ring-amber-500'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2
          `}
        >
          <Play className="w-5 h-5 mr-2" />
          Start
        </button>
        <button
          onClick={handleReset}
          disabled={!isRunning && !isBreathingComplete && intention === ''}
          className={`
            flex items-center px-6 py-3 rounded-full shadow-lg transition-all duration-200
            ${(!isRunning && !isBreathingComplete && intention === '')
              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-400'
            } focus:outline-none focus:ring-2 focus:ring-offset-2
          `}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>

      {isBreathingComplete && (
        <div className="text-center mt-6">
          <p className="text-xl font-bold text-amber-900 animate-pulse">Project light beam toward target</p>
          <p className="text-lg text-green-700 mt-2">Good. Keep practicing.</p>
        </div>
      )}

      {/* Overall Progress Bar */}
      {(isRunning || isBreathingComplete) && (
        <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
      )}
      {(isRunning || isBreathingComplete) && (
        <p className="text-sm text-neutral-600 mt-2">{Math.round(totalProgress)}% Complete</p>
      )}
    </div>
  );
};

export default MentalTransmission;

