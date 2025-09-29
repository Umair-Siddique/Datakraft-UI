import React, { useRef, useEffect } from "react";
import { FileText } from "lucide-react";

const ChatHeader = ({
  currentModel,
  showModelSelector,
  setShowModelSelector,
  onModelChange,
  availableModels,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowModelSelector]);

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-transparent">
{/* AI Model Selector - HIDDEN */}
      {/* <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm"
          style={{
            backgroundColor: "#222",
            color: "#fff",
            border: "1px solid #1E1E1E",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#000";
            e.target.style.color = "#E0E0E0";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#222";
            e.target.style.color = "#fff";
          }}
        >
          <svg
            className="w-4 h-4"
            style={{ color: "#00C2A8" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="text-white hidden sm:inline">
            {currentModel?.name || "Select Model"}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              showModelSelector ? "rotate-180" : ""
            }`}
            style={{ color: "#E0E0E0" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showModelSelector && (
          <div
            className="absolute top-full left-0 mt-2 w-80 rounded-lg shadow-xl z-50"
            style={{
              background: "linear-gradient(135deg, #000 0%, #222 100%)",
              borderColor: "#1E1E1E",
              border: "1px solid #1E1E1E",
            }}
          >
            <div className="p-2">
              <div
                className="text-xs font-medium uppercase tracking-wide mb-2 px-2"
                style={{ color: "#E0E0E0" }}
              >
                Select AI Model
              </div>
              {availableModels?.map((model) => (
                <button
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className="w-full text-left px-3 py-3 rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor:
                      currentModel?.id === model.id ? "#222" : "transparent",
                    color: currentModel?.id === model.id ? "#fff" : "#E0E0E0",
                    border: currentModel?.id === model.id ? "1px solid #1E1E1E" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (currentModel?.id !== model.id) {
                      e.target.style.backgroundColor = "#000";
                      e.target.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentModel?.id !== model.id) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "#E0E0E0";
                    }
                  }}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm mt-1" style={{ color: "#E0E0E0" }}>
                    {model.description}
                  </div>
                  {currentModel?.id === model.id && (
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-4 h-4 mr-1"
                        style={{ color: "#00C2A8" }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs" style={{ color: "#00C2A8" }}>
                        Currently selected
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div> 
  );
};

export default ChatHeader;
