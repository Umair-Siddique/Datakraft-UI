import { useState, useEffect } from "react";
import { X, Settings } from "lucide-react";

const SystemPromptModal = ({
  show,
  onClose,
  onFetchPrompt,
  onUpdatePrompt,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  // Called when modal opens - fetches current system prompt via GET API
  useEffect(() => {
    if (show) {
      fetchCurrentPrompt();
    }
  }, [show]);

  const fetchCurrentPrompt = async () => {
    setFetchLoading(true);
    try {
      // This calls the GET API to fetch current prompt
      const currentPrompt = await onFetchPrompt();
      if (currentPrompt !== null) {
        setPrompt(currentPrompt);
      }
    } catch (error) {
      console.error("Error fetching prompt:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Called when form is submitted - updates system prompt via POST API
  const handleSubmit = async (e) => {
    e.preventDefault();
    // This calls the POST API to update the prompt
    const success = await onUpdatePrompt(prompt);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setPrompt("");
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">
              Configuración del Prompt del Sistema
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-black transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 flex-1">
            <label
              htmlFor="systemPrompt"
              className="block text-sm font-medium text-white mb-2"
            >
              Prompt Global del Sistema
            </label>
            {fetchLoading ? (
              <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-gray-400">Cargando prompt actual...</div>
              </div>
            ) : (
              <textarea
                id="systemPrompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ingresa tu prompt del sistema aquí..."
                className="w-full h-64 px-3 py-2 bg-white border border-gray-300 rounded-md text-black placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={isLoading}
                required
              />
            )}
            <p className="mt-2 text-sm text-gray-400">
              Este prompt se utilizará como contexto del sistema para todas
              las conversaciones.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-black bg-white rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black !text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              disabled={isLoading || fetchLoading || !prompt.trim()}
            >
              {isLoading ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemPromptModal;
