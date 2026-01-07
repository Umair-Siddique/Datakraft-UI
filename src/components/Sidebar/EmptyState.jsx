import { MessageSquare, Search } from "lucide-react";

const EmptyState = ({ type, onRefresh }) => {
  if (type === "loading") {
    return (
      <div
        className="px-4 py-8 flex flex-col items-center justify-center"
        style={{ color: "#E0E0E0" }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p className="text-center">Cargando chats...</p>
      </div>
    );
  }

  if (type === "no-chats") {
    return (
      <div
        className="px-4 py-8 flex flex-col items-center justify-center"
        style={{ color: "#E0E0E0" }}
      >
        <MessageSquare
          size={48}
            className="mb-4 chat-icon"
          style={{ color: "#1F1F1F" }}
        />
        <p className="text-center text-lg font-medium mb-2">Aún no hay chats</p>
        <p className="text-center text-sm mb-4">
          Haz clic en "Nuevo Chat" para comenzar tu primera conversación
        </p>
        <button
          onClick={onRefresh}
          className="text-sm px-3 py-1 rounded-md transition-colors refresh-btn"
          style={{
            backgroundColor: "#1F1F1F",
            color: "#E0E0E0",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#2F2F2F";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#1F1F1F";
          }}
        >
          Actualizar
        </button>
      </div>
    );
  }

  if (type === "no-search-results") {
    return (
      <div
        className="px-4 py-8 flex flex-col items-center justify-center"
        style={{ color: "#E0E0E0" }}
      >
        <Search size={32} className="mb-2" style={{ color: "#1F1F1F" }} />
        <p className="text-center">No hay chats que coincidan con tu búsqueda</p>
        <p className="text-center text-sm mt-1">Prueba con un término de búsqueda diferente</p>
      </div>
    );
  }

  return null;
};

export default EmptyState;