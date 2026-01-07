import React, { useState } from "react";

const NewChatModal = ({ show, onClose, onConfirm, isLoading }) => {
  const [chatName, setChatName] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (chatName.trim()) {
      onConfirm(chatName.trim());
      setChatName("");
    }
  };
  
  const handleClose = () => {
    setChatName("");
    setIsHovered(false); // Reset hover state
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="rounded-lg p-6 w-96 max-w-full mx-4"
        style={{ backgroundColor: '#1F1F1F' }}
      >
        <h2 
          className="text-lg font-semibold mb-4"
          style={{ color: '#E0E0E0' }}
        >
          Crear Nuevo Chat
        </h2>
        
        <div className="mb-4">
          <label
            htmlFor="chatName"
            className="block text-sm font-medium mb-2"
            style={{ color: '#E0E0E0' }}
          >
            Nombre del Chat
          </label>
          <input
            id="chatName"
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ingresa el nombre del chat..."
            className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              backgroundColor: '#1F1F1F',
              border: '1px solid #5BC0EB',
              color: '#E0E0E0'
            }}
            disabled={isLoading}
            autoFocus
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md disabled:opacity-50 transition-all duration-200"
            style={{
              border: '1px solid #5BC0EB',
              color: isHovered && !isLoading ? '#1F1F1F' : '#E0E0E0',
              backgroundColor: isHovered && !isLoading ? '#5BC0EB' : 'transparent'
            }}
            onMouseEnter={() => !isLoading && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(false)}
            onBlur={() => setIsHovered(false)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!chatName.trim() || isLoading}
            className="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #1E1E1E'
            }}
          >
            {isLoading ? "Creando..." : "Crear Chat"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;