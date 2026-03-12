import React from "react";
import { Send, Paperclip } from "lucide-react";

const InputArea = ({
  input,
  handleInputChange,
  handleKeyDown,
  handleSendClick,
  disabled,
  selectedFile,
  handleFileChange,
  selectedNamespace,
  onNamespaceChange,
}) => {
  return (
    <div
      className="p-4 border-t shadow-md inputarea-custom"
      style={{ backgroundColor: "#fff", borderTopColor: "#E0E0E0" }}
    >
      <div className="flex flex-col gap-2">
        {/* Namespace selector */}
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-600 font-medium">
            Colección de documentos
          </label>
          <select
            className="text-xs border rounded-md px-2 py-1 bg-white text-gray-800"
            value={selectedNamespace}
            onChange={(e) => onNamespaceChange?.(e.target.value)}
            disabled={disabled}
          >
            <option value="all">Todas las colecciones</option>
            <option value="informe_anual">Informe Anual</option>
            <option value="libro">Libros Técnicos</option>
            <option value="boletines">Boletines Técnicos</option>
            <option value="manuales">Manuales Técnicos</option>
            <option value="revistas_cientificas">Revistas Científicas</option>
            <option value="memorias">Memorias de Resultados</option>
          </select>
        </div>

        <div className="flex gap-3 items-end relative">
          <div className="flex items-end gap-2 flex-1 relative">
            <div className="flex flex-col items-start gap-1">
            <label
              htmlFor="chat-file-input"
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 cursor-pointer transition-colors ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Paperclip size={18} />
            </label>
            {selectedFile && (
              <span className="max-w-[140px] truncate text-xs text-gray-600">
                {selectedFile.name}
              </span>
            )}
            <input
              id="chat-file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
            </div>

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
            disabled={disabled}
            />
            <style>{`
              .inputarea-custom .message-input::placeholder {
                color: #888 !important;
                opacity: 1 !important;
              }
            `}</style>
            <button
            onClick={handleSendClick}
            className="relative bottom-4 p-3 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#000",
            }}
            onMouseEnter={(e) => {
              if (disabled) return;
              e.target.style.backgroundColor = "#222";
              if (e.target.firstChild) e.target.firstChild.style.color = "#fff";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#000";
              if (e.target.firstChild) e.target.firstChild.style.color = "#fff";
              e.target.style.transform = "scale(1)";
            }}
            disabled={disabled}
            >
              <Send size={20} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
