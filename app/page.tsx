"use client";

import React, { useState } from "react";

import { InputMode } from "@/types";
import InputModeSelector from "@/components/InputModeSelector";
import MorseHelper from "@/components/MorseHelper";
import MorseInput from "@/components/MorseInput";
import TypingTest from "@/components/TypingTest";

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("keyboard-dual");
  const [currentWord, setCurrentWord] = useState<string>("");
  const [enteredMorse, setEnteredMorse] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHelper, setShowHelper] = useState<boolean>(true);

  const handleInputModeChange = (mode: InputMode) => {
    setInputMode(mode);
  };

  const handleMorseInput = (morse: string) => {
    setEnteredMorse(morse);
  };

  const handleSubmit = (text: string) => {
    if (text.trim().toLowerCase() === currentWord.toLowerCase()) {
      setIsCorrect(true);
      setTypedText((prev) => prev + " " + text);
      setCurrentWord("");
      setEnteredMorse("");
      setTimeout(() => {
        setIsCorrect(null);
      }, 1000);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
      }, 1000);
    }
  };

  const resetMorseInput = () => {
    setEnteredMorse("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100">
      <div className="z-10 w-full max-w-3xl items-center justify-between text-sm lg:flex flex-col">
        <h1 className="mb-6 text-3xl font-bold text-center w-full">
          Morse Code Typing Test
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <InputModeSelector
            currentMode={inputMode}
            onModeChange={handleInputModeChange}
          />

          <TypingTest
            currentWord={currentWord}
            setCurrentWord={setCurrentWord}
            typedText={typedText}
            isCorrect={isCorrect}
            resetMorseInput={resetMorseInput}
          />

          <MorseInput
            inputMode={inputMode}
            onMorseInput={handleMorseInput}
            onSubmit={handleSubmit}
            currentWord={currentWord}
          />

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded"
            >
              {showHelper ? "Hide" : "Show"} Morse Code Reference
            </button>

            <button
              onClick={() => {
                setTypedText("");
                setCurrentWord("");
                setEnteredMorse("");
              }}
              className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded"
            >
              Reset Test
            </button>
          </div>

          {showHelper && <MorseHelper />}
        </div>
      </div>
    </main>
  );
}
