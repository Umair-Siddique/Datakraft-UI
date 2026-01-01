import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks";
import DeleteModal from "./DeleteModal";
import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import ChatList from "./ChatList";
import LogoutButton from "./LogoutButton";
import { useChatManagement } from "./useChatManagement";
import UploadDocumentModal from "./UploadDocumentModal";
import SystemPromptModal from "./SystemPromptModal";
import { API_URL } from "../../constants";

const Sidebar = ({ activeId, onSelectChat, onNewChat, onDeleteChat }) => {
  const { logout } = useAuth();
  const {
    recentChats,
    isLoadingChats,
    isCreatingChat,
    fetchChats,
    createNewChat,
  } = useChatManagement();

  // State for modals and UI
  const [showConfirmDeleteChat, setShowConfirmDeleteChat] = useState(false);
  const [chatToDeleteId, setChatToDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [systemPromptLoading, setSystemPromptLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtered chats
  const filteredChats = useMemo(() => {
    if (!searchTerm) return recentChats;
    return recentChats.filter((chat) =>
      chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentChats, searchTerm]);

  // Group chats by time label
  const groupedChats = useMemo(() => {
    const groups = {};
    filteredChats.forEach((chat) => {
      const timeLabel = chat.timeLabel || "Other";
      if (!groups[timeLabel]) {
        groups[timeLabel] = [];
      }
      groups[timeLabel].push(chat);
    });
    return groups;
  }, [filteredChats]);

  // Event handlers
  const handleNewChatClick = async () => {
    await createNewChat("New Chat", onNewChat);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleSystemPromptClick = () => {
    setShowSystemPromptModal(true);
  };

  const handleDeleteChatIntent = (chatId, e) => {
    e.stopPropagation();
    setChatToDeleteId(chatId);
    setShowConfirmDeleteChat(true);
  };

  const handleConfirmDeleteChat = async () => {
    if (!chatToDeleteId) {
      console.log("❌ No chat ID to delete");
      return;
    }

    const chatToDelete = recentChats.find((c) => c.id === chatToDeleteId);
    const chatName = chatToDelete ? chatToDelete.title : "chat";

    setDeleteLoading(true);
    const loadingToastId = toast.loading(`Deleting "${chatName}"...`);

    try {
      console.log("🗑️ Deleting chat with ID:", chatToDeleteId);
      console.log("🗑️ onDeleteChat function exists:", typeof onDeleteChat);
      console.log("🗑️ onDeleteChat:", onDeleteChat);
      
      if (typeof onDeleteChat === 'function') {
        console.log("✅ Calling onDeleteChat...");
        await onDeleteChat(chatToDeleteId);
        console.log("✅ onDeleteChat completed");
      } else {
        console.error("❌ onDeleteChat is not a function!");
        toast.error("Failed to delete chat", { id: loadingToastId });
      }
      
      console.log("🔄 Fetching chats...");
      await fetchChats();

      // Success message is handled in ChatPage's handleDeleteChat
      // Just dismiss the loading toast here
      toast.dismiss(loadingToastId);
    } catch (error) {
      console.error("❌ Error in onDeleteChat:", error);
      toast.error("Failed to delete chat", { id: loadingToastId });
    } finally {
      setDeleteLoading(false);
      setShowConfirmDeleteChat(false);
      setChatToDeleteId(null);
    }
  };

  const getChatNameToDelete = () => {
    const chat = recentChats.find((c) => c.id === chatToDeleteId);
    return chat ? chat.title : "this chat";
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleUploadDocument = async (file, documentType) => {
    let loadingToastId;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const access_token = user?.access_token?.trim();

      console.log("🚀 Starting upload process");
      console.log("📄 File:", file.name, file.size, file.type);
      console.log("📋 Document Type:", documentType);
      console.log("🔑 Token exists:", !!access_token);
      console.log("🌐 API_URL:", API_URL);

      if (!access_token) {
        toast.error("Authentication required");
        setShowUploadModal(false);
        return;
      }

      setUploadLoading(true);
      loadingToastId = toast.loading(`Uploading "${file.name}" as ${documentType}...`);

      // Prepare form data with correct field names
      const formData = new FormData();
      formData.append("document_type", documentType); // This matches your API expectation
      formData.append("file", file); // This matches your API expectation

      console.log("📦 FormData prepared");
      console.log("📦 FormData contents:", {
        document_type: documentType,
        file_name: file.name,
        file_size: file.size
      });

      const response = await fetch(`${API_URL}/document/upload`, {
        method: "POST",
        headers: {
          Authorization: access_token,
          // Don't set Content-Type when using FormData, let the browser set it
        },
        body: formData,
      });

      console.log("📡 Response received:", response.status, response.statusText);
      console.log("📡 Response headers:", Object.fromEntries(response.headers));

      // Handle response based on status
      if (response.status === 200 || response.status === 201) {
        // Success - try to parse response
        let result = { message: "Document uploaded successfully" };
        try {
          const responseText = await response.text();
          console.log("📄 Response text:", responseText);
          if (responseText.trim()) {
            result = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.log("⚠️ Could not parse response, using default success message");
        }

        console.log("✅ Upload successful");
        toast.success(
          result.message || `Document "${file.name}" uploaded successfully as ${documentType}!`, 
          { id: loadingToastId }
        );

        setShowUploadModal(false);
        return;
      }

      // Handle error responses
      let errorMessage = "Failed to upload document";
      try {
        const responseText = await response.text();
        console.log("❌ Error response:", responseText);
        
        if (responseText.trim()) {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        }
      } catch (parseError) {
        console.log("⚠️ Could not parse error response");
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);

    } catch (error) {
      console.error("💥 Upload error:", error);
      
      // Show error toast
      const errorMsg = error.message || "Unknown error occurred";
      if (loadingToastId) {
        toast.error(`Failed to upload "${file.name}": ${errorMsg}`, {
          id: loadingToastId,
        });
      } else {
        toast.error(`Failed to upload "${file.name}": ${errorMsg}`);
      }
    } finally {
      console.log("🏁 Upload process finished, clearing loading state");
      setUploadLoading(false);
    }
  };

  const fetchSystemPrompt = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const access_token = user?.access_token?.trim();

    if (!access_token) {
      toast.error("Authentication required");
      throw new Error("Access token not found. Please log in again.");
    }

    try {
      const response = await fetch(`${API_URL}/prompt/get_user_system_prompt`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`, 
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch system prompt");
      }

      const data = await response.json();
      console.log("Fetched system prompt:", data);
      return data.system_prompt || "";
    } catch (error) {
      console.error("Fetch system prompt error:", error);
      toast.error(`Failed to fetch system prompt: ${error.message}`);
      return null;
    }
  };

  const updateSystemPrompt = async (prompt) => {
    console.log("🚀 Starting updateSystemPrompt with prompt:", prompt);
    
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("👤 User from localStorage:", user);
    
    const access_token = user?.access_token?.trim();
    console.log("🔑 Access token:", access_token ? "Present" : "Missing");

    if (!access_token) {
      console.error("❌ No access token found");
      toast.error("Authentication required");
      return false;
    }

    setSystemPromptLoading(true);
    const loadingToastId = toast.loading("Updating system prompt...");

    // Add timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ Request timed out after 30 seconds");
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      const requestUrl = `${API_URL}/prompt/update_user_system_prompt`;
      console.log("📡 Request URL:", requestUrl);
      
      const requestBody = {
        system_prompt: prompt,
      };
      console.log("📦 Request body:", requestBody);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal, // Add abort signal
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);
      console.log("📥 Response headers:", Object.fromEntries(response.headers));

      // Get response text first to handle both success and error cases
      const responseText = await response.text();
      console.log("📄 Raw response text:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          throw new Error(`HTTP ${response.status}: ${responseText || response.statusText}`);
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse success response
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse success response:", parseError);
        data = { message: "System prompt updated successfully!" };
      }

      console.log("✅ Success data:", data);
      toast.success(data.message || "System prompt updated successfully!", {
        id: loadingToastId,
      });

      setShowSystemPromptModal(false);
      return true;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error("⏰ Request timed out");
        toast.error("Request timed out. Please try again.", {
          id: loadingToastId,
        });
      } else {
        console.error("❌ Update system prompt error:", error);
        console.error("Error stack:", error.stack);
        
        toast.error(`Failed to update system prompt: ${error.message}`, {
          id: loadingToastId,
        });
      }
      return false;
    } finally {
      console.log("🏁 Finally block executed");
      setSystemPromptLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-white border-r text-black sidebar-custom"
      style={{ borderRightColor: "#E0E0E0" }}
    >
      <SidebarHeader
        onNewChatClick={handleNewChatClick}
        isCreatingChat={isCreatingChat}
      />

      {/* Upload Document and System Prompt Buttons */}
      <div className="px-4 py-2 space-y-2">
        {/* Upload Document Button - Hidden */}
        {/* <button
          onClick={handleUploadClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          disabled={uploadLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {uploadLoading ? "Uploading..." : "Upload Document"}
        </button> */}
        
        <button
          onClick={handleSystemPromptClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          disabled={systemPromptLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {systemPromptLoading ? "Loading..." : "System Prompt"}
        </button>
      </div>

      <UploadDocumentModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadDocument}
        isLoading={uploadLoading}
      />
      
      <SystemPromptModal
        show={showSystemPromptModal}
        onClose={() => setShowSystemPromptModal(false)}
        onFetchPrompt={fetchSystemPrompt}
        onUpdatePrompt={updateSystemPrompt}
        isLoading={systemPromptLoading}
      />
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
      />

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <ChatList
          groupedChats={groupedChats}
          activeId={activeId}
          onChatClick={onSelectChat}
          onDeleteChat={handleDeleteChatIntent}
          isLoadingChats={isLoadingChats}
          searchTerm={searchTerm}
          onRefreshChats={fetchChats}
        />
      </div>

      <LogoutButton onLogout={logout} />

      <DeleteModal
        show={showConfirmDeleteChat}
        onClose={() => setShowConfirmDeleteChat(false)}
        onConfirm={handleConfirmDeleteChat}
        chatTitle={getChatNameToDelete()}
        isLoading={deleteLoading}
      />
      
      <style>{`
        .sidebar-custom {
          background: #fff !important;
          color: #000 !important;
        }
        .sidebar-custom *, .sidebar-custom label, .sidebar-custom p, .sidebar-custom span, .sidebar-custom h1, .sidebar-custom h2, .sidebar-custom h3, .sidebar-custom h4, .sidebar-custom h5, .sidebar-custom h6, .sidebar-custom div, .sidebar-custom a {
          color: #000 !important;
        }
        /* New Chat button styles */
        .sidebar-custom .new-chat-btn {
          background: #000 !important;
          color: #fff !important;
          border: none !important;
          padding: 1rem 0 !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 1.1rem !important;
          box-shadow: 0 2px 8px 0 #E0E0E0;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .sidebar-custom .new-chat-btn * {
          color: #fff !important;
          fill: #fff !important;
          stroke: #fff !important;
        }
        .sidebar-custom .new-chat-btn:hover {
          background: #222 !important;
          color: #fff !important;
        }
        /* Search bar styles */
        .sidebar-custom .search-bar-input {
          background: #fff !important;
          border: 1px solid #000 !important;
          color: #888 !important;
        }
        .sidebar-custom .search-bar-input::placeholder {
          color: #888 !important;
          opacity: 1 !important;
        }
        /* Chat icon styles */
        .sidebar-custom .chat-icon {
          color: #888 !important;
          fill: #888 !important;
          border: none !important;
          stroke: #888 !important;
        }
        /* Refresh button styles */
        .sidebar-custom .refresh-btn {
          background: #fff !important;
          color: #000 !important;
          border: none !important;
        }
        .sidebar-custom .refresh-btn:hover {
          background: #f3f3f3 !important;
          color: #000 !important;
        }
        /* Disabled button styles */
        .sidebar-custom button:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        /* Logout button styles - updated for black text and icon */
        .sidebar-custom .logout-btn {
          background: #e5e7eb !important; /* light grey background */
          color: #000 !important;
          border: none !important;
        }
        .sidebar-custom .logout-btn:hover {
          background: #d1d5db !important; /* slightly darker grey on hover */
          color: #000 !important;
        }
        .sidebar-custom .logout-btn * {
          color: #000 !important;
          fill: #000 !important;
          stroke: #000 !important;
        }
        /* Chat list item hover: text white */
        .sidebar-custom .chat-list-item:hover,
        .sidebar-custom .chat-list-item:hover * {
          color: #fff !important;
        }
        /* Active chat: text white */
        .sidebar-custom .chat-list-item.active,
        .sidebar-custom .chat-list-item.active * {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;