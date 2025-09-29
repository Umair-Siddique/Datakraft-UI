import { MessageSquare } from "lucide-react";

const ChatAreaEmptyState = () => {
  const styles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounceSlow {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      33% {
        transform: translateY(-5px) rotate(1deg);
      }
      66% {
        transform: translateY(5px) rotate(-1deg);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.7s ease-out;
    }

    .animate-bounce-slow {
      animation: bounceSlow 3s infinite;
    }

    .animate-float {
      animation: float 4s ease-in-out infinite;
    }

    .animate-slide-up {
      animation: slideUp 0.8s ease-out 0.3s both;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="flex items-center justify-center h-full bg-white">
        <div className="relative bg-white border border-gray-200 rounded-2xl p-10 max-w-xl w-full text-center shadow-lg 
                        animate-fade-in transform transition-all duration-700 hover:shadow-xl hover:scale-105">
          
          {/* Circle with icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center 
                            bg-gray-100 shadow-md animate-bounce-slow hover:animate-pulse
                            transition-all duration-300 hover:bg-gray-200 hover:shadow-lg">
              <MessageSquare className="w-10 h-10 text-black animate-float" />
            </div>
          </div>

          {/* Text */}
          <p className="text-xl font-semibold text-black animate-slide-up">
            Please select a chat to start conversing with <span className="font-bold hover:text-gray-700 transition-colors duration-300">Cybersecurity Agent</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatAreaEmptyState;
