import React, { useEffect, useRef, useState } from "react";

import { InputMode } from "@/types";

interface MorseInputProps {
  inputMode: InputMode;
  onMorseInput: (morse: string) => void;
  onSubmit: (text: string) => void;
  currentWord: string; // Add this to check for auto-submit
}

const MorseInput: React.FC<MorseInputProps> = ({
  inputMode,
  onMorseInput,
  onSubmit,
  currentWord,
}) => {
  const [morseSequence, setMorseSequence] = useState<string>("");
  const [isKeyDown, setIsKeyDown] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState<boolean>(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState<number>(1000); // 1 second default
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState<boolean>(true);

  const inputRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isTonePlayingRef = useRef<boolean>(false);
  const lastInputTimeRef = useRef<number>(Date.now());
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const autoSubmitTimeoutRef = useRef<number | null>(null);

  // Setup audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // Clear any pending timeouts when the component unmounts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
      }
      if (autoSubmitTimeoutRef.current) {
        window.clearTimeout(autoSubmitTimeoutRef.current);
      }
    };
  }, []);

  // Reset function to clear input
  const resetInput = () => {
    setMorseSequence("");
    if (autoAdvanceTimeoutRef.current) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (autoSubmitTimeoutRef.current) {
      window.clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }
  };

  // Auto advance letter function
  const resetAutoAdvanceTimer = () => {
    if (!autoAdvanceEnabled) return;

    // Clear any existing timeout
    if (autoAdvanceTimeoutRef.current) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    // Set last input time
    lastInputTimeRef.current = Date.now();

    // Set new timeout for auto advancing
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      // Only add space if there's Morse content and the last character isn't already a space
      if (
        morseSequence.length > 0 &&
        morseSequence[morseSequence.length - 1] !== " "
      ) {
        setMorseSequence((prev) => prev + " ");

        // Set timer for auto submit after adding space
        startAutoSubmitTimer();
      }
      autoAdvanceTimeoutRef.current = null;
    }, autoAdvanceDelay);
  };

  // Auto submit function
  const startAutoSubmitTimer = () => {
    if (!autoSubmitEnabled) return;

    // Clear any existing timeout
    if (autoSubmitTimeoutRef.current) {
      window.clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }

    // Set new timeout for auto submit (use 1.5x the auto advance delay)
    autoSubmitTimeoutRef.current = window.setTimeout(() => {
      const convertedText = morseToText(morseSequence);
      if (convertedText && convertedText.length > 0) {
        handleSubmit();
      }
      autoSubmitTimeoutRef.current = null;
    }, autoAdvanceDelay * 2);
  };

  // Handle submit
  const handleSubmit = () => {
    const text = morseToText(morseSequence);
    onSubmit(text);
  };

  // Start tone
  const startTone = () => {
    // First, ensure any existing oscillator is stopped
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (error) {
        // Ignore errors from stopping already stopped oscillators
      }
      oscillatorRef.current = null;
    }

    // Clear any pending stop timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (audioContextRef.current && !isTonePlayingRef.current) {
      isTonePlayingRef.current = true;

      try {
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.type = "sine";
        oscillatorRef.current.frequency.setValueAtTime(
          700,
          audioContextRef.current.currentTime
        );

        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);

        oscillatorRef.current.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillatorRef.current.start();
      } catch (error) {
        console.error("Error starting tone:", error);
      }
    }
  };

  // Stop tone
  const stopTone = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (error) {
        // Ignore errors from stopping already stopped oscillators
      }
      oscillatorRef.current = null;
    }
    isTonePlayingRef.current = false;
  };

  // For keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default to avoid scrolling when using spacebar
      if (e.code === "Space" || e.key === "." || e.key === "-") {
        e.preventDefault();
      }

      // Handle input based on input mode
      if (inputMode === "keyboard-dual") {
        // Dot
        if (e.key === "." && !e.repeat) {
          setMorseSequence((prev) => prev + ".");
          playShortTone();
          resetAutoAdvanceTimer();
        }
        // Dash
        else if (e.key === "-" && !e.repeat) {
          setMorseSequence((prev) => prev + "-");
          playLongTone();
          resetAutoAdvanceTimer();
        }
        // Space between letters (manual override)
        else if (e.code === "Space" && !e.repeat) {
          setMorseSequence((prev) => prev + " ");
          // Reset auto advance timer after manual space
          resetAutoAdvanceTimer();
          // Start auto submit timer
          startAutoSubmitTimer();
        }
        // Backspace
        else if (e.key === "Backspace") {
          setMorseSequence((prev) => prev.slice(0, -1));
          resetAutoAdvanceTimer();
        }
        // Enter to submit manually
        else if (e.key === "Enter") {
          handleSubmit();
        }
      } else if (
        inputMode === "keyboard-single" &&
        e.code === "Space" &&
        !e.repeat
      ) {
        setIsKeyDown(true);
        setStartTime(Date.now());
        startTone();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (inputMode === "keyboard-single" && e.code === "Space") {
        setIsKeyDown(false);
        stopTone();

        if (startTime) {
          const duration = Date.now() - startTime;
          if (duration < 200) {
            // Dot for short press
            setMorseSequence((prev) => prev + ".");
          } else {
            // Dash for long press
            setMorseSequence((prev) => prev + "-");
          }
          setStartTime(null);
          resetAutoAdvanceTimer();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    inputMode,
    startTime,
    autoAdvanceEnabled,
    autoAdvanceDelay,
    morseSequence,
    autoSubmitEnabled,
  ]);

  // For mouse input
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      if (inputMode === "mouse-dual") {
        // Left click for dot
        if (e.button === 0) {
          setMorseSequence((prev) => prev + ".");
          playShortTone();
          resetAutoAdvanceTimer();
        }
        // Right click for dash
        else if (e.button === 2) {
          setMorseSequence((prev) => prev + "-");
          playLongTone();
          resetAutoAdvanceTimer();
        }
      } else if (inputMode === "mouse-single") {
        setIsKeyDown(true);
        setStartTime(Date.now());
        startTone();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (inputMode === "mouse-single") {
        setIsKeyDown(false);
        stopTone();

        if (startTime) {
          const duration = Date.now() - startTime;
          if (duration < 200) {
            // Dot for short press
            setMorseSequence((prev) => prev + ".");
          } else {
            // Dash for long press
            setMorseSequence((prev) => prev + "-");
          }
          setStartTime(null);
          resetAutoAdvanceTimer();
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent right-click context menu
      e.preventDefault();
    };

    if (inputRef.current) {
      inputRef.current.addEventListener("mousedown", handleMouseDown);
      inputRef.current.addEventListener("mouseup", handleMouseUp);
      inputRef.current.addEventListener("contextmenu", handleContextMenu);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("mousedown", handleMouseDown);
        inputRef.current.removeEventListener("mouseup", handleMouseUp);
        inputRef.current.removeEventListener("contextmenu", handleContextMenu);
      }
    };
  }, [
    inputMode,
    startTime,
    autoAdvanceEnabled,
    autoAdvanceDelay,
    morseSequence,
    autoSubmitEnabled,
  ]);

  // Auto check if the converted text matches the current word
  useEffect(() => {
    if (morseSequence && currentWord && autoSubmitEnabled) {
      const convertedText = morseToText(morseSequence);
      if (convertedText.toLowerCase() === currentWord.toLowerCase()) {
        // If we have a match, submit automatically
        handleSubmit();
      }
    }
  }, [morseSequence, currentWord, autoSubmitEnabled]);

  // Update parent component with Morse sequence
  useEffect(() => {
    onMorseInput(morseSequence);
  }, [morseSequence, onMorseInput]);

  // Reset input when word changes
  useEffect(() => {
    resetInput();
  }, [currentWord]);

  // Helper function to play tones
  const playShortTone = () => {
    startTone();
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    // Set a new timeout to stop the tone
    timeoutRef.current = window.setTimeout(() => {
      stopTone();
      timeoutRef.current = null;
    }, 100);
  };

  const playLongTone = () => {
    startTone();
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    // Set a new timeout to stop the tone
    timeoutRef.current = window.setTimeout(() => {
      stopTone();
      timeoutRef.current = null;
    }, 300);
  };

  // Helper function to convert Morse code to text
  function morseToText(morse: string): string {
    const morseCodeMap: { [key: string]: string } = {
      ".-": "a",
      "-...": "b",
      "-.-.": "c",
      "-..": "d",
      ".": "e",
      "..-.": "f",
      "--.": "g",
      "....": "h",
      "..": "i",
      ".---": "j",
      "-.-": "k",
      ".-..": "l",
      "--": "m",
      "-.": "n",
      "---": "o",
      ".--.": "p",
      "--.-": "q",
      ".-.": "r",
      "...": "s",
      "-": "t",
      "..-": "u",
      "...-": "v",
      ".--": "w",
      "-..-": "x",
      "-.--": "y",
      "--..": "z",
      ".----": "1",
      "..---": "2",
      "...--": "3",
      "....-": "4",
      ".....": "5",
      "-....": "6",
      "--...": "7",
      "---..": "8",
      "----.": "9",
      "-----": "0",
      ".-.-.-": ".",
      "--..--": ",",
      "..--..": "?",
      ".----.": "'",
      "-.-.--": "!",
      "-..-.": "/",
      "-.--.": "(",
      "-.--.-": ")",
      ".-...": "&",
      "---...": ":",
      "-.-.-.": ";",
      "-...-": "=",
      ".-.-.": "+",
      "-....-": "-",
      "..--.-": "_",
      ".-..-.": '"',
      "...-..-": "$",
      ".--.-.": "@",
    };

    // Split the Morse code into individual characters
    return morse
      .split(" ")
      .map((char) => morseCodeMap[char] || "")
      .join("");
  }

  return (
    <div className="mt-6">
      <h3 className="font-medium mb-2">Morse Input Area</h3>
      <div
        ref={inputRef}
        className={`h-32 border-2 ${
          isKeyDown
            ? "bg-blue-100 border-blue-500"
            : "bg-gray-50 border-gray-300"
        } rounded-md p-4 mb-4 flex items-center justify-center cursor-pointer`}
        tabIndex={0}
      >
        <p className="text-center">
          {isKeyDown ? (
            <span className="text-blue-600 font-bold">SIGNAL ON</span>
          ) : (
            <>Click or press keys here to input Morse code</>
          )}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded mb-3">
        <h4 className="font-medium mb-2">Current Morse Input</h4>
        <div className="bg-white p-2 border rounded min-h-12 text-xl">
          {morseSequence || <span className="text-gray-400">No input yet</span>}
        </div>
        <div className="bg-white p-2 border rounded mt-2 min-h-12 text-xl">
          <span className="text-gray-500">Decoded: </span>
          {morseToText(morseSequence) || (
            <span className="text-gray-400">No text yet</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setMorseSequence((prev) => prev + " ")}
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Add Space
        </button>
        <button
          onClick={() => setMorseSequence((prev) => prev.slice(0, -1))}
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Backspace
        </button>
        <button
          onClick={resetInput}
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Clear
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div>
            <input
              type="checkbox"
              id="auto-advance"
              checked={autoAdvanceEnabled}
              onChange={(e) => setAutoAdvanceEnabled(e.target.checked)}
              className="mr-1"
            />
            <label htmlFor="auto-advance">Auto-advance letters</label>
          </div>

          <div className="flex items-center">
            <label htmlFor="delay" className="mr-1 text-sm">
              Delay:
            </label>
            <input
              type="number"
              id="delay"
              min="500"
              max="3000"
              step="100"
              value={autoAdvanceDelay}
              onChange={(e) => setAutoAdvanceDelay(Number(e.target.value))}
              className="w-16 p-1 border rounded text-sm"
            />
            <span className="text-sm ml-1">ms</span>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="auto-submit"
            checked={autoSubmitEnabled}
            onChange={(e) => setAutoSubmitEnabled(e.target.checked)}
            className="mr-1"
          />
          <label htmlFor="auto-submit">Auto-submit when word is complete</label>
        </div>
      </div>
    </div>
  );
};

export default MorseInput;
