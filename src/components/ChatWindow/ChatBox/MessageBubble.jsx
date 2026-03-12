import React from "react";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Compact markdown components — minimal spacing for AI responses
const compactMarkdownComponents = {
  p: ({ children, ...props }) => (
    <p className="mb-0.5 last:mb-0 leading-tight" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-5 my-0.5 space-y-0 last:mb-0" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-5 my-0.5 space-y-0 last:mb-0" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-tight py-0" {...props}>{children}</li>
  ),
  hr: ({ ...props }) => (
    <hr className="my-1 border-gray-200" {...props} />
  ),
  h1: ({ children, ...props }) => (
    <h1 className="text-lg font-semibold mt-1 mb-0.5 first:mt-0 leading-tight" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-base font-semibold mt-1 mb-0.5 first:mt-0 leading-tight" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-sm font-semibold mt-0.5 mb-0 first:mt-0 leading-tight" {...props}>{children}</h3>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-2 border-gray-300 pl-3 my-0.5 text-gray-600 leading-tight" {...props}>{children}</blockquote>
  ),
};

const MessageBubble = ({ msg, isUser, isFirstAIResponse }) => {
  const handleCopyMessage = async (text) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success("¡Mensaje copiado!", { duration: 1500 });
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
        toast.success("¡Mensaje copiado!", { duration: 1500 });
      } else {
        throw new Error("Copy command failed");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Error al copiar el mensaje.");
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
        className={`relative px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-sm text-sm md:text-base leading-snug transition-all duration-200 hover:shadow-md
          ${getMessageStyles(msg.from, msg.isError)}
          ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
      >
        <div
          className={`whitespace-pre-wrap [&_.message-content>div>*]:mt-0 [&_.message-content>div>*]:mb-0.5 [&_.message-content>div>*]:last:mb-0 ${isFirstAIResponse ? "font-medium" : ""}`}
        >
          <div className="message-content">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={compactMarkdownComponents}
            >
              {msg.text}
            </Markdown>
          </div>
          
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
            title="Copiar mensaje"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
