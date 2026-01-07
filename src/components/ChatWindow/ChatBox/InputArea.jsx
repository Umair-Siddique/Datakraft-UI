import React from "react";
import { Send } from "lucide-react";

const InputArea = ({
  input,
  handleInputChange,
  handleKeyDown,
  handleSendClick,
}) => {
  return (
    <div
      className="p-4 border-t shadow-md inputarea-custom"
      style={{ backgroundColor: "#fff", borderTopColor: "#E0E0E0" }}
    >
      <div className="flex gap-3 items-end relative">
        <div className="flex-1 relative">
          <textarea
            className="w-full resize-none rounded-2xl border message-input px-4 py-3 pr-12 focus:outline-none text-black text-sm shadow-inner transition-all duration-200"
            style={{
              backgroundColor: "#fff",
              borderColor: "#E0E0E0",
              boxShadow: "0 1px 4px 0 #E0E0E0",
            }}
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <style>{`
            .inputarea-custom .message-input::placeholder {
              color: #888 !important;
              opacity: 1 !important;
            }
          `}</style>
        </div>

        <button
          onClick={handleSendClick}
          className="relative bottom-4 p-3 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: "#000",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#222";
            if (e.target.firstChild) e.target.firstChild.style.color = "#fff";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#000";
            if (e.target.firstChild) e.target.firstChild.style.color = "#fff";
            e.target.style.transform = "scale(1)";
          }}
        >
          <Send size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default InputArea;
