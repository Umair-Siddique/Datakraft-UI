import { useState, useEffect } from "react";
import { API_URL } from "../../constants";

export const useChatManagement = () => {
  const [recentChats, setRecentChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // API call to fetch existing chats
  const fetchChats = async () => {
    setIsLoadingChats(true);

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/chat/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Process the conversations and add time labels
      const processedChats = data.conversations.map((conversation) => {
        const createdAt = new Date(conversation.created_at);
        const now = new Date();
        const diffInDays = Math.floor(
          (now - createdAt) / (1000 * 60 * 60 * 24)
        );

        let timeLabel;
        if (diffInDays === 0) {
          timeLabel = "Hoy";
        } else if (diffInDays === 1) {
          timeLabel = "Ayer";
        } else if (diffInDays <= 7) {
          timeLabel = "Esta Semana";
        } else if (diffInDays <= 30) {
          timeLabel = "Este Mes";
        } else {
          timeLabel = "Más Antiguos";
        }

        return {
          id: conversation.id,
          title: conversation.title,
          timeLabel,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          user_id: conversation.user_id,
          messages: [],
        };
      });

      // Sort chats by updated_at (most recent first)
      processedChats.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      setRecentChats(processedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // API call to create new chat
  const createNewChat = async (chatName, onNewChat) => {
    setIsCreatingChat(true);

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/chat/new_chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          title: chatName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Pass the new chat data to parent component
      if (onNewChat) {
        onNewChat({
          id: data.conversation_id,
          title: chatName,
          message: data.message,
        });
      }

      // Refresh the chat list to include the new chat
      await fetchChats();
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert(`Error al crear el chat: ${error.message}`);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Fetch chats when hook is used
  useEffect(() => {
    fetchChats();
  }, []);

  return {
    recentChats,
    isLoadingChats,
    isCreatingChat,
    fetchChats,
    createNewChat,
  };
};
