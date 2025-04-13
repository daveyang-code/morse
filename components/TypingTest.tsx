import React, { useEffect, useRef, useState } from "react";

interface TypingTestProps {
  currentWord: string;
  setCurrentWord: (word: string) => void;
  typedText: string;
  isCorrect: boolean | null;
  resetMorseInput: () => void;
}

const TypingTest: React.FC<TypingTestProps> = ({
  currentWord,
  setCurrentWord,
  typedText,
  isCorrect,
  resetMorseInput
}) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordTimes, setWordTimes] = useState<{word: string, time: number}[]>([]);
  const [lastWordTime, setLastWordTime] = useState<number | null>(null);
  
  // List of words to practice
  const words = [
    "hello", "world", "morse", "code", "next", "react", 
    "signal", "dash", "dot", "radio", "wireless", "telegraph",
    "communication", "transmission", "receiver", "sender",
    "message", "key", "operator", "station", "antenna", "wave",
    "frequency", "broadcast", "international", "distress", "call",
    "alphabet", "number", "practice", "learn", "skill", "master"
  ];

  // Get a random word
  const getRandomWord = () => {
    return words[Math.floor(Math.random() * words.length)];
  };

  // Set a random word if none exists and start the timer
  useEffect(() => {
    if (!currentWord) {
      setCurrentWord(getRandomWord());
      setStartTime(Date.now());
    }
  }, [currentWord, setCurrentWord]);

  // Track word completion time
  useEffect(() => {
    if (isCorrect === true && startTime) {
      const endTime = Date.now();
      const timeInSeconds = (endTime - startTime) / 1000;
      setLastWordTime(timeInSeconds);
      setWordTimes(prev => [...prev, { word: currentWord, time: timeInSeconds }]);
      setStartTime(Date.now()); // Reset timer for next word
    }
  }, [isCorrect, currentWord, startTime]);

  // Calculate average time
  const calculateAverageTime = () => {
    if (wordTimes.length === 0) return null;
    const total = wordTimes.reduce((sum, item) => sum + item.time, 0);
    return (total / wordTimes.length).toFixed(2);
  };

  // Calculate best time
  const calculateBestTime = () => {
    if (wordTimes.length === 0) return null;
    const best = Math.min(...wordTimes.map(item => item.time));
    return best.toFixed(2);
  };

  return (
    <div className="my-6">
      <h2 className="text-lg font-semibold mb-2">Typing Test</h2>
      
      <div className="p-4 bg-gray-50 rounded-md">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Current Word</h3>
          <div className="text-2xl font-bold">
            {currentWord}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Words Typed</h3>
          <div className="text-lg">
            {typedText.trim() || "No words typed yet"}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Timing</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-2 rounded border">
              <div className="text-xs text-gray-500">Last Word</div>
              <div className="font-medium">{lastWordTime ? `${lastWordTime.toFixed(2)}s` : 'N/A'}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-xs text-gray-500">Average</div>
              <div className="font-medium">{calculateAverageTime() ? `${calculateAverageTime()}s` : 'N/A'}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-xs text-gray-500">Best</div>
              <div className="font-medium">{calculateBestTime() ? `${calculateBestTime()}s` : 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <div className="h-6">
          {isCorrect === true && (
            <div className="text-green-600 font-medium">Correct! New word assigned.</div>
          )}
          {isCorrect === false && (
            <div className="text-red-600 font-medium">Incorrect. Try again.</div>
          )}
        </div>
      </div>
      
      <button
        onClick={() => {
          setWordTimes([]);
          setLastWordTime(null);
          setStartTime(Date.now());
          setCurrentWord(getRandomWord());
          resetMorseInput();
        }}
        className="mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Reset Stats & Get New Word
      </button>
    </div>
  );
};

export default TypingTest;