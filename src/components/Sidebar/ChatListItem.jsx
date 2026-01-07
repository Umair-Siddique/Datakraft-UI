import { MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { API_URL } from "../../constants";

const ChatListItem = ({ chatId, chat, title, activeId, onChatClick, onDeleteChat }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  activeId === chatId && console.log("chatId", chatId);
  activeId === chatId && console.log("title", title);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteChat(chat.id, e);
  };

  const handleChatClick = () => {
    if (!isEditing) {
      onChatClick(chat.id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(chat.title);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    
    if (editTitle.trim() === chat.title.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    
    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error('No access token found in localStorage');
        setIsUpdating(false);
        return;
      }

      const response = await fetch(`${API_URL}/chat/update_chat_title/${chat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          title: editTitle.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Chat title updated:', result.message);
        
        // Update the local chat object (you might want to call a parent function to update the state)
        chat.title = editTitle.trim();
        setIsEditing(false);
      } else {
        console.error('Failed to update chat title:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit(e);
    } else if (e.key === 'Escape') {
      handleCancelEdit(e);
    }
  };

  return (
    <div
      onClick={handleChatClick}
      className="group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors"
      style={{
        backgroundColor: activeId === chat.id
          ? "#1F1F1F" // Changed from blue to black
          : isHovered
          ? "rgba(31, 31, 31, 0.5)" // 50% transparent black
          : "transparent",
        color: activeId === chat.id || isHovered ? "white" : "#222",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <MessageSquare
          size={16}
          color={activeId === chat.id || isHovered ? "white" : "#1F2937"}
        />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium bg-transparent border-b border-current outline-none w-full !text-white"
              autoFocus
              disabled={isUpdating}
            />
          ) : (
            <p
              className={`text-sm font-medium truncate ${activeId === chat.id || isHovered ? '!text-white' : 'text-gray-800'}`}
            >
              {chat.title}
            </p>
          )}
              {chat.messages && chat.messages.length > 0 && !isEditing && (
            <p
              className={`text-xs truncate mt-1 ${
                activeId === chat.id || isHovered
                  ? "!text-white text-opacity-80"
                  : "text-gray-500"
              }`}
            >
              {chat.messages[chat.messages.length - 1]?.text || "Sin mensajes"}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="opacity-100 p-1 rounded transition-all !text-white hover:bg-green-600"
              aria-label="Save title"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="opacity-100 p-1 rounded transition-all !text-white hover:bg-gray-500"
              aria-label="Cancel edit"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            {activeId === chat.id && (
              <button
              onClick={handleEditClick}
              className="opacity-100 p-1 rounded transition-all"
              aria-label="Edit title"
            >
              <Edit2 size={14} color="white" />
            </button>                                              
            )}
            <button
  onClick={handleDeleteClick}
  className={`${activeId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} p-1 rounded transition-all hover:bg-red-600 ${
    activeId === chat.id || isHovered ? '!text-white' : 'text-gray-300'
  }`}
  aria-label="Delete chat"
>
  <Trash2 
    size={14} 
    color={activeId === chat.id || isHovered ? "white" : "#9CA3AF"} 
  />
</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;