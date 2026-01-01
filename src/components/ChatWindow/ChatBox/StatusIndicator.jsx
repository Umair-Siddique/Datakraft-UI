import React from "react";

const StatusIndicator = ({ status }) => {
  if (!status) return null;

  return (
    <div className="flex items-center justify-start mb-4 animate-fade-in">
      <div className="flex-shrink-0 mr-3 md:mr-4">
        {/* Animated ripple effect */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Outer ripple */}
          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping" />
          {/* Middle ripple */}
          <div className="absolute inset-1 rounded-full bg-blue-500 opacity-30 animate-pulse" />
          {/* Inner circle */}
          <div className="relative w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-medium">
          {status}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.2;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default StatusIndicator;

