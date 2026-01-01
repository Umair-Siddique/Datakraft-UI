import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import ChatAreaEmptyState from "../components/ChatWindow/ChatBox/EmptyState";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { API_URL } from "../constants";

const ChatPage = () => {
  const [recentChats, setRecentChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [shouldFetchMessages, setShouldFetchMessages] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  // Keyboard event handler for mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Memoized time label calculation
  const getChatTimeLabel = useCallback((date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const chatDate = new Date(date);
    const chatDay = new Date(
      chatDate.getFullYear(),
      chatDate.getMonth(),
      chatDate.getDate()
    );

    const diffTime = today.getTime() - chatDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return "Previous 7 Days";
    if (diffDays <= 30) return "Previous 30 Days";

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return chatDay.getFullYear() === today.getFullYear()
      ? months[chatDay.getMonth()]
      : `${months[chatDay.getMonth()]} ${chatDay.getFullYear()}`;
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = () => {
      try {
        // Load local chats from localStorage
        const storedChats = localStorage.getItem("recentChats");
        const localChats = storedChats ? JSON.parse(storedChats) : [];

        // Sort chats by date
        const sortedChats = localChats.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setRecentChats(sortedChats);

        // Don't automatically set active chat - show empty state initially
        // User needs to select a chat to start
      } catch (error) {
        console.error("Failed to initialize data:", error);
        toast.error("Failed to load chat history");
      }
    };

    initializeData();
  }, []);

  // Persist chats to localStorage
  useEffect(() => {
    if (recentChats.length > 0) {
      localStorage.setItem("recentChats", JSON.stringify(recentChats));
    }
  }, [recentChats]);

  // Create new chat
  const createNewChat = useCallback(() => {
    const newId = uuidv4();
    const now = new Date();

    const newChat = {
      id: newId,
      title: "New Chat",
      timeLabel: getChatTimeLabel(now),
      date: now.toISOString(),
      messages: [],
    };

    setRecentChats((prevChats) => {
      // Remove existing empty chats
      const filteredChats = prevChats.filter(
        (chat) =>
          !(
            chat.title === "New Chat" &&
            (!chat.messages || chat.messages.length === 0)
          )
      );
      return [newChat, ...filteredChats];
    });

    setActiveId(newId);
    setShouldFetchMessages(false); // New chat doesn't need to fetch
    return newId;
  }, [getChatTimeLabel]);

  // Handle new chat creation
  const handleNewChat = useCallback(() => {
    const existingEmptyChat = recentChats.find(
      (chat) =>
        chat.title === "New Chat" &&
        (!chat.messages || chat.messages.length === 0)
    );

    if (existingEmptyChat) {
      setActiveId(existingEmptyChat.id);
      setShouldFetchMessages(false); // Empty chat doesn't need to fetch
    } else {
      const newChatId = createNewChat();
      // Ensure the new chat is set as active
      if (newChatId) {
        setActiveId(newChatId);
        setShouldFetchMessages(false);
      }
    }
  }, [recentChats, createNewChat]);

  // Handle chat selection - this is when we want to fetch messages
  const handleSelectChat = useCallback((chatId) => {
    setActiveId(chatId);
    setShouldFetchMessages(true); // Trigger fetch when chat is clicked
  }, []);

  // Handle sending messages
  const handleSend = useCallback(
    (messageObj) => {
      setRecentChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== activeId) return chat;

          const existingMessageIndex = chat.messages.findIndex(
            (msg) => msg.id === messageObj.id
          );

          const updatedMessages = [...chat.messages];
          const messageWithTimestamp = {
            ...messageObj,
            id: messageObj.id || uuidv4(),
            timestamp: new Date().toISOString(),
          };

          if (existingMessageIndex > -1) {
            updatedMessages[existingMessageIndex] = {
              ...updatedMessages[existingMessageIndex],
              ...messageWithTimestamp,
            };
          } else {
            updatedMessages.push(messageWithTimestamp);
          }

          return { ...chat, messages: updatedMessages };
        })
      );
    },
    [activeId]
  );

  // Handle chat deletion
  const handleDeleteChat = useCallback(
    async (chatId) => {
      console.log("🔥 handleDeleteChat called with chatId:", chatId);
      console.log("🔥 chatId type:", typeof chatId);
      
      try {
        // Get access token from localStorage (try both storage methods)
        const userStr = localStorage.getItem("user");
        console.log("👤 User string from localStorage:", userStr ? "exists" : "null");
        
        const user = JSON.parse(userStr || "{}");
        console.log("👤 Parsed user object:", user);
        
        const accessToken = user?.access_token || localStorage.getItem('access_token');
        console.log("🔑 Access token:", accessToken);
        console.log("🔑 Access token length:", accessToken?.length);
        
        if (!accessToken) {
          console.error("❌ No access token found!");
          toast.error("Authentication required");
          return;
        }

        // Make API call to delete chat (correct endpoint: /chat/delete_chat/{id})
        const apiUrl = `${API_URL}/chat/delete_chat/${chatId}`;
        console.log("📡 DELETE request to:", apiUrl);
        console.log("📡 Authorization header:", `Bearer ${accessToken}`);
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        console.log("📥 Response status:", response.status);

        if (response.ok) {
          console.log("✅ Chat deleted successfully");
          // Remove chat from local state
          setRecentChats((prevChats) => {
            const chatToDelete = prevChats.find((chat) => chat.id === chatId);
            const updatedChats = prevChats.filter((chat) => chat.id !== chatId);

            // Update active chat if the deleted chat was active
            if (chatId === activeId) {
              setShouldFetchMessages(false); // Reset fetch trigger
              // If there are remaining chats, select the first one, otherwise show empty state
              setActiveId(updatedChats.length > 0 ? updatedChats[0].id : null);
            }

            if (chatToDelete) {
              toast.success(`"${chatToDelete.title}" deleted successfully`, {
                duration: 2000,
              });
            }

            return updatedChats;
          });
        } else {
          console.error("❌ Delete failed with status:", response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Error data:", errorData);
          toast.error(errorData.message || "Failed to delete chat");
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
        toast.error("Failed to delete chat");
      }
    },
    [activeId]
  );

  // Memoized sidebar props to prevent unnecessary re-renders
  const sidebarProps = useMemo(
    () => ({
      recentChats,
      activeId,
      onSelectChat: handleSelectChat,
      onNewChat: handleNewChat,
      onDeleteChat: handleDeleteChat,
    }),
    [recentChats, activeId, handleSelectChat, handleNewChat, handleDeleteChat]
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Mobile/Tablet header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="text-white"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? (
            <ChevronLeft className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
          <span className="sr-only">{isMobileOpen ? "Close" : "Menu"}</span>
        </button>

        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">Binkr Daita</h1>
        </div>

        <div className="w-6"></div>
      </div>

      {/* Mobile/Tablet backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile/Tablet sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-hidden">
          <Sidebar {...sidebarProps} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden md:block relative bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
          isDesktopCollapsed ? "w-16" : "w-80"
        }`}
      >
        {/* Collapse toggle */}
        <div className="absolute -right-3 top-6 z-10">
          <button
            onClick={() => setDesktopCollapsed((prev) => !prev)}
            aria-label={
              isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="flex items-center justify-center w-6 h-6 xl:w-7 xl:h-7 rounded-full bg-gray-700 text-gray-300 shadow-md hover:bg-gray-600 transition-colors"
          >
            {isDesktopCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sidebar content */}
        <div
          className={`h-full transition-opacity duration-300 ${
            isDesktopCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Sidebar {...sidebarProps} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #222 0%, #000 100%)' }}>
        <div className="flex-1 relative">
          {activeId ? (
            <ChatWindow
              activeId={activeId}
              onSend={handleSend}
              shouldFetchMessages={shouldFetchMessages}
            />
          ) : (
            <ChatAreaEmptyState onNewChat={handleNewChat} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
