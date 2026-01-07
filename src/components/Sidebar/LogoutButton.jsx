import { LogOut } from "lucide-react";

const LogoutButton = ({ onLogout }) => {
  return (
    <div className="p-4 border-t" style={{ borderTopColor: "#1F1F1F" }}>
      <button
        onClick={onLogout}
        className={`logout-btn w-full flex items-center justify-center px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black`}
      >
        <LogOut size={16} className="mr-2 text-black" />
        <span className="text-black">Cerrar Sesión</span>
      </button>
    </div>
  );
};

export default LogoutButton;