"use client";

import { useState, useRef, useEffect } from "react";
import ChatUI from "@/components/ChatUI";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant' as const, content: data.reply }]);
      } else {
        setMessages([
          ...newMessages, 
          { role: 'assistant' as const, content: "Sorry, I couldn't process your request. Please try again." }
        ]);
        console.error("API error:", data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages, 
        { role: 'assistant' as const, content: "Sorry, there was an error processing your request. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen lg:w-3xl mx-auto bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">S</div>
        <div>
          <h1 className="text-lg font-semibold">Sales Assistant</h1>
          <p className="text-xs text-gray-500">Property, Car, Insurance & Medical Services</p>
        </div>
      </header>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Welcome! How can I help you today?</p>
            <p className="text-sm mt-2">Ask me about property, car, insurance, or medical center services.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user" 
                  ? "bg-blue-500 text-white rounded-br-none" 
                  : "bg-white text-gray-800 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <ChatUI onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
