import { InputMode } from "@/types";
import React from "react";

interface InputModeSelectorProps {
  currentMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

const InputModeSelector: React.FC<InputModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Input Mode</h2>
      <div className="flex flex-wrap gap-2">
        <button
          className={`py-2 px-4 rounded ${
            currentMode === "keyboard-dual"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => onModeChange("keyboard-dual")}
        >
          Keyboard - Two Keys (Auto)
        </button>
        <button
          className={`py-2 px-4 rounded ${
            currentMode === "keyboard-single"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => onModeChange("keyboard-single")}
        >
          Keyboard - One Key (Manual)
        </button>
        <button
          className={`py-2 px-4 rounded ${
            currentMode === "mouse-dual"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => onModeChange("mouse-dual")}
        >
          Mouse - Both Buttons (Auto)
        </button>
        <button
          className={`py-2 px-4 rounded ${
            currentMode === "mouse-single"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => onModeChange("mouse-single")}
        >
          Mouse - Single Button (Manual)
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>
          <strong>Auto mode:</strong> Use dot (.) key and dash (-) key, or left and right mouse buttons.
        </p>
        <p>
          <strong>Manual mode:</strong> Use spacebar or any mouse button - short press for dot, long press for dash.
        </p>
      </div>
    </div>
  );
};

export default InputModeSelector;