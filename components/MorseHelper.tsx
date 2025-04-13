import React from "react";

const MorseHelper: React.FC = () => {
  const morseCode = [
    { letter: "a", morse: ".-" },
    { letter: "b", morse: "-..." },
    { letter: "c", morse: "-.-." },
    { letter: "d", morse: "-.." },
    { letter: "e", morse: "." },
    { letter: "f", morse: "..-." },
    { letter: "g", morse: "--." },
    { letter: "h", morse: "...." },
    { letter: "i", morse: ".." },
    { letter: "j", morse: ".---" },
    { letter: "k", morse: "-.-" },
    { letter: "l", morse: ".-.." },
    { letter: "m", morse: "--" },
    { letter: "n", morse: "-." },
    { letter: "o", morse: "---" },
    { letter: "p", morse: ".--." },
    { letter: "q", morse: "--.-" },
    { letter: "r", morse: ".-." },
    { letter: "s", morse: "..." },
    { letter: "t", morse: "-" },
    { letter: "u", morse: "..-" },
    { letter: "v", morse: "...-" },
    { letter: "w", morse: ".--" },
    { letter: "x", morse: "-..-" },
    { letter: "y", morse: "-.--" },
    { letter: "z", morse: "--.." },
    { letter: "1", morse: ".----" },
    { letter: "2", morse: "..---" },
    { letter: "3", morse: "...--" },
    { letter: "4", morse: "....-" },
    { letter: "5", morse: "....." },
    { letter: "6", morse: "-...." },
    { letter: "7", morse: "--..." },
    { letter: "8", morse: "---.." },
    { letter: "9", morse: "----." },
    { letter: "0", morse: "-----" },
  ];

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-md">
      <h3 className="font-medium mb-4">Morse Code Reference</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {morseCode.map((item) => (
          <div key={item.letter} className="flex items-center p-2 bg-white rounded border">
            <span className="text-xl font-semibold w-6">{item.letter}</span>
            <span className="text-lg ml-2">{item.morse}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MorseHelper;