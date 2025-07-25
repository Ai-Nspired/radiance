import React, { useState, useEffect } from 'react';
import { Lightbulb, Eye, Shield, Sparkles, Heart, Zap, Clock, TrendingUp, Target, Sun, Brain, Handshake, ChevronRight, ChevronDown } from 'lucide-react';
// Magnetic Breathing Timer Component
const MagneticBreathingTimer = () => {
  const phases = [
    { name: "Inhale", duration: 8, text: "I claim this energy" },
    { name: "Hold", duration: 8, text: "I transform this force" },
    { name: "Exhale", duration: 8, text: "I radiate purpose" }
  ];
  const totalCycles = 5;
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Initialize AudioContext and Oscillator
  useEffect(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (!oscillatorRef.current) {
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.type = 'sine'; // Sine wave for a clean beep
        oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
        oscillatorRef.current.connect(audioContextRef.current.destination);
      }
    } catch (e) {
      console.error("Web Audio API not supported or failed to initialize:", e);
      // Fallback for environments where AudioContext might not be available
      // For Canvas, this might be the case due to iframe restrictions.
      // We'll just skip audio cues if it fails.
    }
    return () => {
      // Clean up audio context on unmount
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
      gainNode.gain.setValueAtTime(0.5, now); // Volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Fade out

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

  // Main timer logic
  useEffect(() => {
    if (isRunning && currentCycle < totalCycles) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Play a higher pitch beep at the end of a phase
            playBeep(880);

            const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
            if (nextPhaseIndex === 0) { // Completed a full cycle
              const nextCycle = currentCycle + 1;
              if (nextCycle >= totalCycles) {
                setIsRunning(false); // All cycles complete
                clearInterval(timerRef.current);
                return 0; // Stop timer
              }
              setCurrentCycle(nextCycle);
            }
            setCurrentPhaseIndex(nextPhaseIndex);
            return phases[nextPhaseIndex].duration;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => clearInterval(timerRef.current); // Cleanup on unmount or isRunning change
  }, [isRunning, currentCycle, currentPhaseIndex, phases]);

  // Handle start/pause
  const handleStartPause = () => {
    if (!isRunning && currentCycle >= totalCycles) { // If finished, reset before starting
      handleReset();
    }
    setIsRunning(!isRunning);
    // Resume AudioContext if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setCurrentCycle(0);
    setCurrentPhaseIndex(0);
    setTimeLeft(phases[0].duration);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const currentPhase = phases[currentPhaseIndex];
  const progressPercentage = (timeLeft / currentPhase.duration) * 100;
  const totalProgress = ((currentCycle * phases.length + currentPhaseIndex) / (totalCycles * phases.length)) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border border-amber-200">
      <h3 className="text-xl font-semibold text-amber-800 mb-4">Magnetic Breathing Exercise</h3>
      <div className="relative w-48 h-48 rounded-full bg-amber-100 flex items-center justify-center mb-6 overflow-hidden shadow-inner">
        {/* Progress circle background */}
        <div
          className="absolute inset-0 bg-amber-300 transform origin-bottom transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleY(${progressPercentage / 100})` }}
        ></div>
        {/* Text overlay */}
        <div className="relative z-10 flex flex-col items-center text-amber-900">
          <p className="text-sm font-medium opacity-70">Cycle {currentCycle + 1} of {totalCycles}</p>
          <p className="text-3xl font-bold mb-2">{currentPhase.name}</p>
          <p className="text-5xl font-extrabold">{timeLeft}</p>
          <p className="text-base italic mt-2 text-center max-w-[80%]">{currentPhase.text}</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleStartPause}
          className="flex items-center px-6 py-3 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {isRunning ? "Pause" : (currentCycle >= totalCycles ? "Restart" : "Start")}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center px-6 py-3 bg-neutral-200 text-neutral-800 rounded-full shadow-lg hover:bg-neutral-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>

      {currentCycle >= totalCycles && (
        <p className="text-lg font-semibold text-green-700 mt-4">Exercise Complete! Well done.</p>
      )}

      {/* Overall Progress Bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-4">
        <div
          className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${totalProgress}%` }}
        ></div>
      </div>
      <p className="text-sm text-neutral-600 mt-2">{Math.round(totalProgress)}% Complete</p>
    </div>
  );
};

// Data structure for all lessons and their content
const lessonsData = [
  {
    id: 'lesson1',
    title: 'Recognizing Your Inner Power',
    icon: <Lightbulb className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l1-concept',
        buttonText: 'Core Principle',
        content: (
          <>
            <p className="mb-2">Humans function as bio-electrical systems constantly emitting and receiving energy fields. Your personal magnetism is the conscious direction of this innate force.</p>
            <p className="font-semibold text-amber-900">Key Insight: Magnetic individuals consciously channel their energy rather than leaking it through uncontrolled emotions.</p>
          </>
        ),
      },
      {
        id: 'l1-ex1',
        buttonText: 'Energy Awareness',
        content: (
          <>
            <p className="mb-2 font-semibold">Energy Scan Exercise (10 min daily):</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Sit comfortably with palms facing upward</li>
              <li>Visualize energy collecting in your palms</li>
              <li>Notice temperature changes or tingling sensations</li>
              <li>Practice directing this energy toward a specific object in the room</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson2',
    title: 'The Magnetic Presence',
    icon: <Eye className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l2-concept',
        buttonText: 'Core Traits',
        content: (
          <>
            <p className="mb-2">Magnetic individuals exhibit:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">Centered Calm:</strong> Physical stillness reflecting inner composure</li>
              <li><strong className="text-amber-900">Laser Focus:</strong> Attentive presence without distraction</li>
              <li><strong className="text-amber-900">Emotional Reserve:</strong> Measured responses to external stimuli</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l2-ex1',
        buttonText: 'Calm Anchoring',
        content: (
          <>
            <p className="mb-2 font-semibold">Stillness Practice (5x daily):</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When entering new spaces, pause for 3 seconds</li>
              <li>Plant feet firmly, relax shoulders</li>
              <li>Take one deep breath before speaking or moving</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l2-ex2',
        buttonText: 'Gaze Training',
        content: (
          <>
            <p className="mb-2 font-semibold">Focused Attention Drill:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Choose an object (candle, plant, artwork)</li>
              <li>Maintain uninterrupted focus for 2 minutes</li>
              <li>Notice details without mental commentary</li>
              <li>Gradually increase duration daily</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson3',
    title: 'Overcoming Magnetic Drain',
    icon: <Shield className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l3-concept',
        buttonText: 'Energy Leaks',
        content: (
          <>
            <p className="mb-2">Common magnetism drains:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">Victim Language:</strong> "Why does this always happen to me?"</li>
              <li><strong className="text-amber-900">Approval Seeking:</strong> Fishing for compliments</li>
              <li><strong className="text-amber-900">Emotional Splashing:</strong> Oversharing personal drama</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l3-ex1',
        buttonText: 'Complaint Detox',
        content: (
          <>
            <p className="mb-2 font-semibold">24-Hour Complaint Fast:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Wear a rubber band on your wrist</li>
              <li>Each complaint = snap band + reset counter</li>
              <li>Goal: 24 complaint-free hours</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l3-ex2',
        buttonText: 'Flattery Shield',
        content: (
          <>
            <p className="mb-2 font-semibold">Flattery Response Protocol:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When praised: Pause 2 seconds</li>
              <li>Respond: "I appreciate you noticing"</li>
              <li>Change subject within 20 seconds</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson4',
    title: 'Building Magnetic Reserve',
    icon: <Sparkles className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l4-concept',
        buttonText: 'Power of Restraint',
        content: (
          <>
            <p className="mb-2">Strategic restraint builds magnetic tension:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Unspoken thoughts create psychological pull</li>
              <li>Delayed gratification builds personal power</li>
              <li>Controlled revelation increases perceived value</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l4-ex1',
        buttonText: 'Desire Containment',
        content: (
          <>
            <p className="mb-2 font-semibold">Impulse Management:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When desire arises, pause 60 seconds</li>
              <li>Write it down instead of acting</li>
              <li>Visualize energy flowing to your core</li>
              <li>Delay fulfillment by 24 hours minimum</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l4-ex2',
        buttonText: 'Information Control',
        content: (
          <>
            <p className="mb-2 font-semibold">The 70/30 Disclosure Rule:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>In conversations, disclose only 70% of what you could</li>
              <li>Maintain 30% reserve at all times</li>
              <li>Answer questions with 15-20 word responses</li>
              <li>Follow each answer with an open question</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson5',
    title: 'Mastering Approval Energy',
    icon: <Heart className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l5-concept',
        buttonText: 'Approval Dynamics',
        content: (
          <>
            <p className="mb-2">The approval paradox:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Seeking approval repels it</li>
              <li>Indifference attracts validation</li>
              <li>Energy follows attention - focus outward</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l5-ex1',
        buttonText: 'Craving Observation',
        content: (
          <>
            <p className="mb-2 font-semibold">Approval Journal (3 days):</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Note every approval-seeking thought</li>
              <li>Categorize: Validation, Reassurance, Status</li>
              <li>For each: Write alternative affirmation</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l5-ex2',
        buttonText: 'Curiosity Building',
        content: (
          <>
            <p className="mb-2 font-semibold">The Magnetic Pause Technique:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When praised: Smile silently for 3 seconds</li>
              <li>Respond with "That's interesting"</li>
              <li>Ask "What specifically made you notice that?"</li>
              <li>Listen without adding to your accomplishment</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
  // ... (rest of lessonsData before lesson6)
  {
    id: 'lesson6',
    title: 'Energy Transformation',
    icon: <Zap className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l6-concept',
        buttonText: 'Force Conversion',
        content: (
          <>
            <p className="mb-2">Emotional energy conversion:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Strong impulses = high-potential energy</li>
              <li>Containment transforms emotional charge</li>
              <li>Redirected energy becomes personal power</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l6-ex1',
        buttonText: 'Breathing Sequence',
        // THIS IS THE CRUCIAL LINE THAT RENDERS THE TIMER COMPONENT
        content: <MagneticBreathingTimer />,
      },
      {
        id: 'l6-ex2',
        buttonText: 'Temptation Alchemy',
        content: (
          <>
            <p className="mb-2 font-semibold">Temptation Conversion Protocol:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When tempted, freeze for 10 seconds</li>
              <li>Visualize energy flowing upward from gut to head</li>
              <li>Channel into creative action immediately</li>
              <li>Record transformed energy in journal</li>
            </ol>
          </>
        ),
      },
    ],
  },
// ... (rest of lessonsData after lesson6)
   
    id: 'lesson7',
    title: 'Timing and Transformation',
    icon: <Clock className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l7-concept',
        buttonText: 'Progression',
        content: (
          <>
            <p className="mb-2">Noticeable changes occur within 4-5 days of consistent practice:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Increased calm under pressure</li>
              <li>Natural posture improvement</li>
              <li>Heightened situational awareness</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l7-ex1',
        buttonText: 'Desire Containment',
        content: (
          <>
            <p className="mb-2 font-semibold">Silent Achievement Protocol:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Complete a meaningful task</li>
              <li>Consciously avoid mentioning it to anyone</li>
              <li>Notice internal satisfaction without external validation</li>
              <li>Journal the energy difference</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l7-ex2',
        buttonText: 'Energy Banking',
        content: (
          <>
            <p className="mb-2 font-semibold">Energy Banking System:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Carry a small notebook for 3 days</li>
              <li>Each time you restrain an impulse, note "Energy Deposit"</li>
              <li>Each energy leak (complaint, overshare), note "Withdrawal"</li>
              <li>Strive for 3:1 deposit-to-withdrawal ratio</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson8',
    title: 'Observing Transformation',
    icon: <TrendingUp className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l8-concept',
        buttonText: 'Signs of Progress',
        content: (
          <>
            <p className="mb-2">Physical manifestations of magnetic development:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">Eye Brightness:</strong> Increased pupil dilation and sparkle</li>
              <li><strong className="text-amber-900">Posture Shift:</strong> Natural straightening without effort</li>
              <li><strong className="text-amber-900">Voice Resonance:</strong> Deeper, clearer vocal tone</li>
              <li><strong className="text-amber-900">Reaction Time:</strong> Slower, more measured responses</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l8-ex1',
        buttonText: 'Daily Scan',
        content: (
          <>
            <p className="mb-2 font-semibold">Transformation Tracker:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Daily 5-minute video self-recording</li>
              <li>Note 3 physical changes in posture/expression</li>
              <li>Record 1 interaction where you maintained composure</li>
              <li>Weekly comparison review</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson9',
    title: 'Practical Magnetic Techniques',
    icon: <Target className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l9-concept',
        buttonText: 'Applied Magnetism',
        content: (
          <>
            <p className="mb-2">Essential magnetic practices:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">The Unbroken Gaze:</strong> 80/20 eye contact ratio</li>
              <li><strong className="text-amber-900">Silent Presence:</strong> Comfort with conversational pauses</li>
              <li><strong className="text-amber-900">Energy Containment:</strong> Maintaining personal space bubble</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l9-ex1',
        buttonText: 'Central Gaze',
        content: (
          <>
            <p className="mb-2 font-semibold">Triangle Gazing Technique:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Focus on the bridge of their nose</li>
              <li>Mentally draw triangle between both eyes and mouth</li>
              <li>Rotate focus every 5-7 seconds</li>
              <li>Practice with TV personalities daily</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l9-ex2',
        buttonText: 'Magnetic Projection',
        content: (
          <>
            <p className="mb-2 font-semibold">Handshake Energy Transfer:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Before handshake, ground feet firmly</li>
              <li>Visualize energy flowing to your palm</li>
              <li>Make full palm-to-palm contact</li>
              <li>Apply firm, sustained pressure (2-3 seconds)</li>
              <li>Release with slight downward motion</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson10',
    title: 'Mastering the Magnetic Gaze',
    icon: <Eye className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l10-concept',
        buttonText: 'Gaze Dynamics',
        content: (
          <>
            <p className="mb-2">Advanced gaze techniques:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">Penetrating Gaze:</strong> Seeing through rather than at</li>
              <li><strong className="text-amber-900">Soft Focus:</strong> Relaxed peripheral awareness</li>
              <li><strong className="text-amber-900">Energy Projection:</strong> Sending intention through eyes</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l10-ex1',
        buttonText: 'Dot Training',
        content: (
          <>
            <p className="mb-2 font-semibold">Progressive Dot Exercise:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Place black dot at eye level</li>
              <li>Start with 2-minute focused gazing</li>
              <li>Daily increase by 30 seconds</li>
              <li>Goal: 15 minutes without blinking/wavering</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l10-ex2',
        buttonText: 'Live Practice',
        content: (
          <>
            <p className="mb-2 font-semibold">Conversational Gaze Practice:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>In conversations, maintain gaze during listening</li>
              <li>While speaking, break gaze periodically</li>
              <li>Note emotional reactions in others</li>
              <li>Record which gaze patterns create connection</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson11',
    title: 'Direct Energy Projection',
    icon: <Sun className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l11-concept',
        buttonText: 'Radiation Methods',
        content: (
          <>
            <p className="mb-2">Conscious energy direction techniques:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">Targeted Projection:</strong> Sending energy to specific individuals</li>
              <li><strong className="text-amber-900">Environmental Charging:</strong> Infusing spaces with your energy</li>
              <li><strong className="text-amber-900">Object Imprinting:</strong> Charging items with intention</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l11-ex1',
        buttonText: 'Mental Transmission',
        content: (
          <>
            <p className="mb-2 font-semibold">Mental Sending Protocol:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Write intention in 5 words or less</li>
              <li>Gaze at words while taking 7 deep breaths</li>
              <li>Visualize words transforming to light</li>
              <li>Project light beam toward target</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l11-ex2',
        buttonText: 'Solar Plexus Activation',
        content: (
          <>
            <p className="mb-2 font-semibold">Core Power Breathing:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Place hands on solar plexus</li>
              <li>Inhale deeply through nose (4s)</li>
              <li>Hold breath while pulsing abdomen (8s)</li>
              <li>Exhale with "HA" sound (8s)</li>
              <li>Repeat 5x before important events</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l11-ex3',
        buttonText: 'Full-Body Channeling',
        content: (
          <>
            <p className="mb-2 font-semibold">Tension Channeling Technique:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Tense all muscles simultaneously for 10s</li>
              <li>Release while visualizing energy flowing outward</li>
              <li>Direct flow through hands or eyes</li>
              <li>Immediately follow with decisive action</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson12',
    title: 'The Faith Multiplier',
    icon: <Heart className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l12-concept',
        buttonText: 'Belief Dynamics',
        content: (
          <>
            <p className="mb-2">Faith as magnetic catalyst:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Doubt creates energy leaks</li>
              <li>Certainty amplifies projection</li>
              <li>Confidence creates self-reinforcing reality</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l12-ex1',
        buttonText: 'Doubt Suspension',
        content: (
          <>
            <p className="mb-2 font-semibold">Doubt Containment Protocol:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When doubt arises, visualize boxing it</li>
              <li>Label "For later review"</li>
              <li>Schedule 5-minute doubt session hours later</li>
              <li>Most doubts disappear before review time</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l12-ex2',
        buttonText: 'Certainty Cultivation',
        content: (
          <>
            <p className="mb-2 font-semibold">Evidence Journaling:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Daily record 3 magnetic successes</li>
              <li>Note physical/emotional evidence</li>
              <li>Review weekly to build certainty</li>
              <li>Create "proof portfolio" of successes</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson13',
    title: 'Willpower Integration',
    icon: <Brain className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l13-concept',
        buttonText: 'Will Development',
        content: (
          <>
            <p className="mb-2">Willpower as directed magnetism:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Small daily victories build will muscle</li>
              <li>Consistency &gt; intensity</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l13-ex1',
        buttonText: 'Ambidextrous Challenges',
        content: (
          <>
            <p className="mb-2 font-semibold">Ambidextrous Challenges:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Simultaneous writing: dominant hand writes gratitude list, non-dominant draws circles</li>
              <li>Daily 5-minute practice</li>
              <li>Increase complexity weekly</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l13-ex2',
        buttonText: 'Applied Will Practice',
        content: (
          <>
            <p className="mb-2 font-semibold">The 10-Second Rule:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When avoiding something, commit to 10 seconds</li>
              <li>When desiring something, delay 10 seconds</li>
              <li>Gradually increase to 30 seconds</li>
              <li>Notice strengthened decision muscle</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson14',
    title: 'Active Influence Techniques',
    icon: <Handshake className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l14-concept',
        buttonText: 'Conscious Projection',
        content: (
          <>
            <p className="mb-2">Advanced influence methods:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-amber-900">Energy Matching:</strong> Harmonizing before leading</li>
              <li><strong className="text-amber-900">Silent Command:</strong> Projecting intention without words</li>
              <li><strong className="text-amber-900">Field Anchoring:</strong> Maintaining center while others move</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l14-ex1',
        buttonText: 'Magnetic Induction',
        content: (
          <>
            <p className="mb-2 font-semibold">The Pull Technique:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>When someone speaks, lean slightly forward</li>
              <li>Nod minimally at key points</li>
              <li>After they finish, pause 3 seconds before responding</li>
              <li>Note increased engagement</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l14-ex2',
        buttonText: 'Affirmation Broadcasting',
        content: (
          <>
            <p className="mb-2 font-semibold">Silent Affirmation Practice:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Before meetings, visualize successful outcome</li>
              <li>Mentally repeat "They respect my presence"</li>
              <li>Project through solar plexus during handshakes</li>
              <li>Maintain internal mantra throughout interaction</li>
            </ol>
          </>
        ),
      },
    ],
  },
  {
    id: 'lesson15',
    title: 'Sustained Magnetic Presence',
    icon: <Sparkles className="w-5 h-5 mr-2" />,
    sections: [
      {
        id: 'l15-concept',
        buttonText: 'Lifetime Practice',
        content: (
          <>
            <p className="mb-2">Magnetism maintenance:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Energy conservation becomes automatic</li>
              <li>Willpower application becomes reflexive</li>
              <li>Presence radiates without conscious effort</li>
              <li>Continuous refinement through self-observation</li>
            </ul>
          </>
        ),
      },
      {
        id: 'l15-ex1',
        buttonText: 'Daily Integration',
        content: (
          <>
            <p className="mb-2 font-semibold">Morning Centering Routine:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>5-minutes solar plexus breathing</li>
              <li>3-minute gaze stabilization</li>
              <li>1-minute willpower affirmation</li>
              <li>Set daily magnetism intention</li>
            </ol>
          </>
        ),
      },
      {
        id: 'l15-ex2',
        buttonText: 'Weekly Energy Audit',
        content: (
          <>
            <p className="mb-2 font-semibold">Weekly Energy Audit:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Review energy deposits/withdrawals</li>
              <li>Identify 3 key magnetism successes</li>
              <li>Note 1 area for improvement</li>
              <li>Plan specific practice for coming week</li>
            </ol>
          </>
        ),
      },
    ],
  },
];

const App = () => {
  // State to manage the currently active main lesson tab
  const [activeLesson, setActiveLesson] = useState(lessonsData[0].id);
  // State to manage the active inner tab for each lesson
  const [activeInnerTab, setActiveInnerTab] = useState(() => {
    const initialInnerTabs = {};
    lessonsData.forEach(lesson => {
      if (lesson.sections.length > 0) {
        initialInnerTabs[lesson.id] = lesson.sections[0].id;
      }
    });
    return initialInnerTabs;
  });

  // Function to handle clicking on a main lesson tab
  const handleLessonClick = (lessonId) => {
    setActiveLesson(lessonId);
    // When a new main lesson is selected, reset its inner tab to the first one
    const lesson = lessonsData.find(l => l.id === lessonId);
    if (lesson && lesson.sections.length > 0) {
      setActiveInnerTab(prev => ({
        ...prev,
        [lessonId]: lesson.sections[0].id
      }));
    }
  };

  // Function to handle clicking on an inner tab button
  const handleInnerTabClick = (lessonId, sectionId) => {
    setActiveInnerTab(prev => ({
      ...prev,
      [lessonId]: sectionId
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-stone-800 font-serif p-4 sm:p-6 lg:p-8">
      {/* Tailwind CSS CDN for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Google Fonts for Merriweather and Playfair Display */}
      <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Playfair+Display:700&display=swap" rel="stylesheet" />

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-900 border-b-4 border-amber-700 pb-3 mb-6 font-display text-center">
        Unlocking Your Inner Radiance: A Guide to Personal Magnetism
      </h1>

      {/* Main Navigation Tabs */}
      <nav className="flex flex-wrap justify-center border-b-3 border-amber-700 mb-4 bg-amber-100 rounded-lg shadow-md overflow-hidden">
        {lessonsData.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => handleLessonClick(lesson.id)}
            className={`
              flex items-center justify-center flex-grow sm:flex-grow-0
              py-3 px-4 sm:px-6 text-sm sm:text-base font-medium
              text-amber-900 transition-all duration-300 ease-in-out
              border-r border-amber-300 last:border-r-0
              hover:bg-amber-200 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
              ${activeLesson === lesson.id ? 'bg-amber-700 text-white shadow-inner' : ''}
            `}
            style={{ fontFamily: 'Merriweather, serif' }}
          >
            {lesson.icon}
            Lesson {lessonsData.indexOf(lesson) + 1}
          </button>
        ))}
      </nav>

      {/* Content Panes for Each Lesson */}
      {lessonsData.map((lesson) => (
        <section
          key={lesson.id}
          id={lesson.id}
          className={`
            content-pane bg-white p-6 rounded-xl shadow-lg
            transition-all duration-500 ease-in-out transform
            ${activeLesson === lesson.id ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-2'}
            mb-8
          `}
        >
          {/* Lesson Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-4 font-display">
            {lesson.title}
          </h2>

          {/* Inner Tabs for Lesson Sections */}
          <div className="inner-tabs flex flex-wrap justify-center sm:justify-start border-b-2 border-amber-300 mb-4">
            {lesson.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleInnerTabClick(lesson.id, section.id)}
                className={`
                  flex-grow sm:flex-grow-0 py-2 px-4 sm:px-6 text-sm sm:text-base
                  bg-amber-100 border-none cursor-pointer transition-all duration-300 ease-in-out
                  hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                  rounded-t-md
                  ${activeInnerTab[lesson.id] === section.id ? 'bg-amber-700 text-white shadow-inner' : 'text-amber-900'}
                `}
                style={{ fontFamily: 'Merriweather, serif' }}
              >
                {section.buttonText}
              </button>
            ))}
          </div>

          {/* Inner Content Sections */}
          {lesson.sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className={`
                inner-content mt-4 p-4 sm:p-6 bg-neutral-50 rounded-lg border border-amber-200
                transition-all duration-300 ease-in-out
                ${activeInnerTab[lesson.id] === section.id ? 'block opacity-100' : 'hidden opacity-0'}
              `}
            >
              {section.content}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default App;
        
