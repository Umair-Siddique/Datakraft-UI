import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { API_URL } from "../../constants";
import MessageWindow from "./ChatBox/MessageWindow";
import InputArea from "./ChatBox/InputArea";
import ChatHeader from "./ChatBox/ChatHeader";
import StatusIndicator from "./ChatBox/StatusIndicator";

// Available AI models
const AI_MODELS = [
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    description: "Default - Balanced performance",
  },
  {
    id:"mistral-large-latest",
    name: "Mistral AI",
    description: "Mistral's latest model",
  },
  {
    id:"gpt-4o",
    name: "Open AI",
    description: "Open AI's Premium Model",
  }
];

const ChatWindow = ({ activeId, shouldFetchMessages = false }) => {
  const [input, setInput] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    "claude-sonnet-4-20250514"
  );
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamingAiResponseText, setStreamingAiResponseText] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  // Namespace selection for retriever API; "all" means use all collections
  const [selectedNamespace, setSelectedNamespace] = useState("all");

  // Function to fetch messages for a specific chat
  const fetchChatMessages = async (chatId) => {
    if (!chatId) return;

    setIsLoadingMessages(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const access_token = user?.access_token;

      if (!access_token) {
        throw new Error("Access token not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/chat/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Transform the messages to match the expected format
      // Backend returns messages with "role" field ("user" or "assistant")
      // Sort by timestamp to ensure correct chronological order (oldest first)
      const transformedMessages =
        data.messages?.map((msg) => ({
          id: msg.id,
          from: msg.role === "user" ? "user" : "ai", // Map "assistant" to "ai"
          text: msg.content,
          timestamp: msg.created_at,
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) || []; // Sort oldest to newest

      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(`Error al cargar mensajes: ${error.message}`);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Modified effect - only fetch when shouldFetchMessages is true
  useEffect(() => {
    if (activeId && shouldFetchMessages) {
      fetchChatMessages(activeId);
    } else if (!activeId) {
      setMessages([]);
    }
  }, [activeId, shouldFetchMessages]);

  // Helper function to convert messages to history format for retrieval API
  const convertMessagesToHistory = (messages) => {
    return messages.map((msg) => ({
      sender: msg.from === "user" ? "user" : "ai",
      content: msg.text,
    }));
  };

  const sendRetrievalQuery = async (query, file = null) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const access_token = user?.access_token;

      if (!access_token) {
        throw new Error("Access token not found. Please log in again.");
      }

      const conversationId = activeId || uuidv4();
      const trimmedQuery = query.trim();

      let response;

      if (file) {
        // When a file is attached, use multipart/form-data
        const formData = new FormData();
        formData.append("conversation_id", conversationId);
        formData.append("query", trimmedQuery);
        formData.append("file", file);
        // Pass selected namespace (backend accepts multiple "namespaces" fields)
        formData.append("namespaces", selectedNamespace || "all");

        response = await fetch(`${API_URL}/retriever/query`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          body: formData,
        });
      } else {
        // Fallback to JSON request when no file is attached
        const requestPayload = {
          query: trimmedQuery,
          conversation_id: conversationId,
          // Backend expects an array of namespace keys
          namespaces: [selectedNamespace || "all"],
        };

        response = await fetch(`${API_URL}/retriever/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(requestPayload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = "";
      let buffer = "";

      // Create streaming message ID
      const streamingId = uuidv4();
      setStreamingMessageId(streamingId);
      
      // Don't add message yet - wait for content to start

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream finished.");
          // Clear status when done
          setCurrentStatus(null);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split by newlines to get individual lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Handle SSE format with "data: " prefix
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(trimmedLine.slice(6)); // Remove "data: " prefix
              
              // Handle different response types based on the API specification
              if (jsonData.type === "status") {
                // Show status message with animated indicator
                console.log("Status:", jsonData.message);
                setCurrentStatus(jsonData.message);
              } else if (jsonData.type === "content") {
                // Clear status when content starts streaming
                setCurrentStatus(null);
                
                // Append content chunk to accumulated answer (backend may send full or incremental)
                const textChunk = jsonData.message ?? "";
                accumulatedAnswer += textChunk;
                setStreamingAiResponseText(accumulatedAnswer);
                
                // Create or update the streaming message
                setMessages(prev => {
                  const existingMessage = prev.find(msg => msg.id === streamingId);
                  if (existingMessage) {
                    return prev.map(msg => 
                      msg.id === streamingId 
                        ? { ...msg, text: accumulatedAnswer, isStreaming: true }
                        : msg
                    );
                  }
                  return [...prev, {
                    from: "ai",
                    text: accumulatedAnswer,
                    id: streamingId,
                    timestamp: new Date().toISOString(),
                    isStreaming: true,
                  }];
                });
                // Yield so React can render incrementally (prevents batching from hiding streaming)
                await new Promise(resolve => setTimeout(resolve, 0));
              } else if (jsonData.type === "done") {
                // Mark streaming as complete
                console.log("Stream complete");
                setCurrentStatus(null);
                setMessages(prev => prev.map(msg => 
                  msg.id === streamingId 
                    ? { ...msg, isStreaming: false }
                    : msg
                ));
              } else if (jsonData.type === "error") {
                // Handle error - create message if none exists yet
                setCurrentStatus(null);
                const errorText = jsonData.message ?? "Unknown error";
                setMessages(prev => {
                  const existing = prev.find(msg => msg.id === streamingId);
                  if (existing) {
                    return prev.map(msg =>
                      msg.id === streamingId
                        ? { ...msg, text: `Error: ${errorText}`, isError: true, isStreaming: false }
                        : msg
                    );
                  }
                  return [...prev, {
                    from: "ai",
                    text: `Error: ${errorText}`,
                    id: streamingId,
                    timestamp: new Date().toISOString(),
                    isError: true,
                    isStreaming: false,
                  }];
                });
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError, "Line:", trimmedLine);
            }
          }
        }
      }

      return { success: true, response: accumulatedAnswer };
    } catch (error) {
      console.error("Error in sendRetrievalQuery:", error);
      
      // If there's an error and we have a streaming message, update it with error
      if (streamingMessageId) {
        setMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId 
            ? { 
                ...msg, 
                text: `Error: ${error.message}`, 
                isError: true, 
                isStreaming: false 
              }
            : msg
        ));
      }
      
      return { success: false, error: error.message };
    }
  };

  const handleSendClick = async () => {
    if (!input.trim() || isSendingMessage) return;

    const userMessage = input.trim();
    setIsSendingMessage(true);
    setStreamingAiResponseText("");
    setCurrentStatus(null);
    setStreamingMessageId(null);

    try {
      const userMessageObj = {
        from: "user",
        text: userMessage,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessageObj]);
      setInput("");

      const apiResponse = await sendRetrievalQuery(userMessage, selectedFile);

      // Note: The streaming message is already handled in sendRetrievalQuery
      // We don't need to add another message here for success case
      if (!apiResponse.success && !streamingMessageId) {
        // Only add error message if we didn't already handle it in streaming
        setMessages((prev) => [
          ...prev,
          {
            from: "ai",
            text: `Error: ${apiResponse.error}`,
            isError: true,
            id: uuidv4(),
            timestamp: new Date().toISOString(),
          },
        ]);
        toast.error(`Error al enviar mensaje: ${apiResponse.error}`);
      }
    } catch (error) {
      console.error("Critical error in handleSendClick:", error);
      toast.error(`Ocurrió un error crítico: ${error.message}`);
    } finally {
      setIsSendingMessage(false);
      setStreamingAiResponseText("");
      setCurrentStatus(null);
      setStreamingMessageId(null);
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    setShowModelSelector(false);

    const selectedModelInfo = AI_MODELS.find((model) => model.id === modelId);
    toast.success(`Cambiado a ${selectedModelInfo.name}`, {
      duration: 2000,
    });
  };

  const currentModel = AI_MODELS.find((model) => model.id === selectedModel);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  return (
    <div
      className="flex flex-col h-screen relative chatwindow-custom"
      style={{ background: "#fff" }}
    >
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          {/* Top-left namespace selector */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">
              Colección
            </span>
            <select
              className="mt-1 text-xs border rounded-md px-2 py-1 bg-white text-gray-800"
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
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

          {/* Existing chat header (model selector, title, etc.) */}
          <div className="flex-1 ml-4">
            <ChatHeader
              currentModel={currentModel}
              showModelSelector={showModelSelector}
              setShowModelSelector={setShowModelSelector}
              onModelChange={handleModelChange}
              availableModels={AI_MODELS}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MessageWindow
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          currentStatus={currentStatus}
        />
      </div>

      <div className="flex-shrink-0">
        <InputArea
          input={input}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleSendClick={handleSendClick}
          disabled={isSendingMessage || isLoadingMessages}
          selectedFile={selectedFile}
          handleFileChange={handleFileChange}
          selectedNamespace={selectedNamespace}
          onNamespaceChange={setSelectedNamespace}
        />
      </div>

      <style>{`
        .chatwindow-custom {
          background: #fff !important;
        }
        .chatwindow-custom .message-input {
          background: #fff !important;
          color: #000 !important;
          border: 1px solid #E0E0E0 !important;
        }
        .chatwindow-custom .message-input::placeholder {
          color: #888 !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;