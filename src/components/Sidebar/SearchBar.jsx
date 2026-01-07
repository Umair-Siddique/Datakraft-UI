import { Search, X } from "lucide-react";

const SearchBar = ({ searchTerm, onSearchChange, onClearSearch }) => {
  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="p-4 border-b" style={{ borderBottomColor: "#1F1F1F" }}>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          style={{ color: "#E0E0E0" }}
        />
        <input
          type="text"
          placeholder="Buscar chats..."
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full pl-10 pr-10 py-2 rounded-md search-bar-input focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "#1F1F1F",
            borderColor: "#1F1F1F",
            border: "1px solid",
            "::placeholder": { color: "#E0E0E0" },
            ":focus": {
              ringColor: "#5BC0EB",
              borderColor: "transparent",
            },
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "transparent";
            e.target.style.boxShadow = "0 0 0 2px #5BC0EB";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#1F1F1F";
            e.target.style.boxShadow = "none";
          }}
        />
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
            style={{ color: "#E0E0E0" }}
            onMouseEnter={(e) => (e.target.style.color = "white")}
            onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;