import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import StatusIndicator from "./StatusIndicator";

const MessageWindow = ({ messages, isLoadingMessages, currentStatus }) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when loading state changes (when messages are first loaded)
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      // Use a small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [isLoadingMessages, messages.length]);

  return (
    <div 
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{ 
        scrollBehavior: 'smooth',
        overflowAnchor: 'none' // Prevents automatic scroll anchoring that might interfere
      }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {isLoadingMessages && messages.length === 0 && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <MessageItem
            key={msg.id || index}
            messages={messages}
            msg={msg}
            index={index}
          />
        ))}
        
        {/* Status Indicator - shown when processing */}
        {currentStatus && <StatusIndicator status={currentStatus} />}
        
        {/* Empty div to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageWindow;