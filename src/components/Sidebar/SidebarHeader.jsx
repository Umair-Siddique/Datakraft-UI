import { Plus } from "lucide-react";

const SidebarHeader = ({ onNewChatClick, isCreatingChat }) => {
  return (
    <div className="p-4 border-b" style={{ borderBottomColor: "#1F1F1F" }}>
      <button
        onClick={onNewChatClick}
        disabled={isCreatingChat}
        className="w-full flex items-center justify-center px-4 py-3 rounded-md space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed new-chat-btn"
        // Remove inline styles that conflict with CSS
        // style={{
        //   backgroundColor: "#fff",
        //   color: "#000",
        //   border: "1px solid #1E1E1E"
        // }}
        // Remove JavaScript hover handlers that interfere with CSS
        // onMouseEnter={e => {
        //   if (!isCreatingChat) e.target.style.backgroundColor = '#f3f3f3';
        // }}
        // onMouseLeave={e => {
        //   if (!isCreatingChat) e.target.style.backgroundColor = '#fff';
        // }}
      >
        <Plus size={18} className="text-white" />
        <span>{isCreatingChat ? "Creando..." : "Nuevo Chat"}</span>
      </button>
    </div>
  );
};

export default SidebarHeader;
