import { useState, useRef, useEffect } from "react";

interface ChatUIProps {
  onSend: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatUI({ onSend, isLoading }: ChatUIProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Only focus the input field when the component initially mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="sticky bottom-0 bg-white border-t p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about Singapore real estate property..."
            className="border border-gray-300 rounded-full py-3 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            disabled={isLoading}
            autoFocus
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse mr-1"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150 mr-1"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-300"></div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-800 hover:bg-blue-900 text-white rounded-full p-2 w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
      <div className="text-xs text-gray-500 text-center mt-2">
        Ask about buying, selling, property values, or neighborhood insights in
        Singapore
      </div>
    </div>
  );
}
