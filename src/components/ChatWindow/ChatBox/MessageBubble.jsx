import React from "react";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'; // <-- ADD THIS IMPORT

const MessageBubble = ({ msg, isUser, isFirstAIResponse }) => {
  const handleCopyMessage = async (text) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success("Message copied!", { duration: 1500 });
        return;
      }

      // Fallback for non-HTTPS environments
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast.success("Message copied!", { duration: 1500 });
      } else {
        throw new Error("Copy command failed");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy message.");
    }
  };

  const getMessageStyles = (from, isError) => {
    if (from === "user") {
      return "bg-gray-200 text-gray-900 shadow-gray-300/25"; // Light grey for user messages
    }
    if (isError) {
      return "bg-gradient-to-br from-red-900/20 to-red-800/20 text-red-200 border border-red-700/50";
    }
    return "bg-white text-gray-900 border border-gray-200 shadow-gray-200/20"; // White for AI responses
  };

  return (
    <div className="relative group/message">
      <div
        className={`relative px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed transition-all duration-200 hover:shadow-md
          ${getMessageStyles(msg.from, msg.isError)}
          ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
      >
        <div
          className={`whitespace-pre-wrap ${
            isFirstAIResponse ? "font-medium" : ""
          }`}
        >
          {/* MODIFY THIS LINE: Add the remarkPlugins prop */}
          <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
          
          {/* Streaming cursor indicator */}
          {msg.isStreaming && !isUser && (
            <span className="inline-block w-2 h-4 ml-1 bg-gray-900 animate-blink" />
          )}
        </div>
        
        {/* Add blink animation for cursor */}
        <style>{`
          @keyframes blink {
            0%, 49% {
              opacity: 1;
            }
            50%, 100% {
              opacity: 0;
            }
          }
          
          .animate-blink {
            animation: blink 1s infinite;
          }
        `}</style>

        {/* Copy Button */}
        {!msg.isError && (
          <button
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-lg
                             bg-gray-700 shadow-lg border border-gray-600
                             hover:bg-gray-600 hover:scale-105
                             text-gray-300 hover:text-white
                             opacity-0 group-hover:opacity-100 group/message-hover:opacity-100
                             transition-all duration-200 ease-out z-20
                             ${isUser ? "-left-12" : "-right-12"}`}
            onClick={() => handleCopyMessage(msg.text)}
            title="Copy message"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
