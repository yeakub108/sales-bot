"use client";

import { useState, useRef, useEffect } from "react";
import ChatUI from "@/components/ChatUI";
import { formatMarkdown } from "@/utils/markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Helper function to format message content with proper rendering of bullet points, numbering and emojis
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatMessageContent = (content: string): React.ReactNode => {
  // First, split the content by line breaks to process each paragraph
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        // Check for numbered lists (e.g., "1. Item" or "1) Item")
        if (/^\d+[.)]\s.+/.test(line)) {
          return (
            <div key={i} className="my-1">
              {line}
            </div>
          );
        }

        // Check for bullet points (e.g., "- Item" or "• Item")
        else if (/^[-•]\s.+/.test(line)) {
          return (
            <div key={i} className="my-1 ml-2">
              {line}
            </div>
          );
        }

        // Check for section headers with emojis (e.g., "🔎 1. Eligibility Check")
        else if (
          line.match(/^(\p{Emoji}|🔎|🏠|💰|📍)\s\d+\.\s.+/u) ||
          line.match(
            /^(\ud83d\udd0e|\ud83c\udfe0|\ud83d\udcb0|\ud83d\udccd)\s\d+\.\s.+/
          )
        ) {
          return (
            <div key={i} className="font-bold text-blue-800 mt-3 mb-1">
              {line}
            </div>
          );
        }

        // Check for section headers without numbers but with emojis
        else if (
          line.match(/^(\p{Emoji}|🔎|🏠|💰|📍)\s.+/u) ||
          line.match(
            /^(\ud83d\udd0e|\ud83c\udfe0|\ud83d\udcb0|\ud83d\udccd)\s.+/
          )
        ) {
          return (
            <div key={i} className="font-bold text-blue-800 mt-3 mb-1">
              {line}
            </div>
          );
        }

        // Check for bold text with asterisks (e.g., "**Bold text**")
        else if (line.includes("**")) {
          // Replace **text** with <strong>text</strong>
          const boldReplacedLine = line.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
          );
          return (
            <div
              key={i}
              className="my-1"
              dangerouslySetInnerHTML={{ __html: boldReplacedLine }}
            />
          );
        }

        // Empty lines become proper spacing
        else if (line.trim() === "") {
          return <div key={i} className="h-2"></div>;
        }

        // Regular paragraph
        else {
          return (
            <div key={i} className="my-1">
              {line}
            </div>
          );
        }
      })}
    </>
  );
};

// Helper function to generate highly dynamic and contextual follow-up questions based on conversation
const getContextualFollowUps = (content: string): string[] => {
  const content_lower = content.toLowerCase();
  const suggestedQuestions: string[] = [];

  // Extract key topics from the response
  const extractTopics = () => {
    const topics = [];
    // Check for specific property types
    if (content_lower.includes("hdb")) topics.push("hdb");
    if (
      content_lower.includes("condo") ||
      content_lower.includes("condominium")
    )
      topics.push("condo");
    if (
      content_lower.includes("landed") ||
      content_lower.includes("bungalow") ||
      content_lower.includes("terrace")
    )
      topics.push("landed");

    // Check for specific areas/regions
    const areas = [
      "punggol",
      "tampines",
      "bedok",
      "jurong",
      "woodlands",
      "yishun",
      "ang mo kio",
      "toa payoh",
      "central",
      "east",
      "west",
      "north",
      "south",
    ];
    areas.forEach((area) => {
      if (content_lower.includes(area)) topics.push(area);
    });

    // Check for specific concepts
    if (content_lower.includes("bto")) topics.push("bto");
    if (content_lower.includes("resale")) topics.push("resale");
    if (content_lower.includes("rental") || content_lower.includes("rent"))
      topics.push("rental");
    if (content_lower.includes("loan") || content_lower.includes("mortgage"))
      topics.push("financing");
    if (content_lower.includes("price") || content_lower.includes("cost"))
      topics.push("pricing");
    if (content_lower.includes("eligibility")) topics.push("eligibility");
    if (content_lower.includes("agent") || content_lower.includes("commission"))
      topics.push("agent");
    if (content_lower.includes("negotiate")) topics.push("negotiation");

    return topics;
  };

  const topics = extractTopics();

  // Add topic-specific questions based on the content
  if (topics.includes("hdb")) {
    // BTO vs Resale context
    if (topics.includes("bto") && !topics.includes("resale")) {
      suggestedQuestions.push(
        "How long does the BTO application process take?"
      );
      suggestedQuestions.push("What factors affect my BTO ballot chances?");
    } else if (topics.includes("resale") && !topics.includes("bto")) {
      suggestedQuestions.push(
        "What should I look for when viewing resale flats?"
      );
      suggestedQuestions.push("How is the resale value calculated?");
    }
    // General HDB questions
    if (topics.includes("eligibility")) {
      suggestedQuestions.push("Can singles buy HDB flats?");
      suggestedQuestions.push("What are the income ceiling requirements?");
    } else {
      suggestedQuestions.push("What are the HDB grant options available?");
    }
  }

  // Condo-specific questions
  if (topics.includes("condo")) {
    suggestedQuestions.push("What are the maintenance fees for condos?");
    suggestedQuestions.push("Which condos have the best facilities?");
    if (topics.includes("investment") || topics.includes("financing")) {
      suggestedQuestions.push("What is the average ROI for condos now?");
    }
  }

  // Financing-specific questions
  if (topics.includes("financing")) {
    if (!content_lower.includes("interest rate")) {
      suggestedQuestions.push("What are the current interest rates?");
    }
    if (!content_lower.includes("down payment")) {
      suggestedQuestions.push("How much down payment is required?");
    }
    if (!content_lower.includes("cpf")) {
      suggestedQuestions.push("Can I use my CPF for this?");
    }
  }

  // Area-specific questions
  const locationAreas = [
    "punggol",
    "tampines",
    "bedok",
    "jurong",
    "woodlands",
    "yishun",
    "ang mo kio",
    "toa payoh",
  ];
  const foundArea = topics.find((topic) => locationAreas.includes(topic));

  if (foundArea) {
    suggestedQuestions.push(`What are property prices like in ${foundArea}?`);
    suggestedQuestions.push(`Are there good schools in ${foundArea}?`);
  }

  // Process/procedure specific questions
  if (
    content_lower.includes("process") ||
    content_lower.includes("procedure") ||
    content_lower.includes("steps")
  ) {
    if (!content_lower.includes("time") && !content_lower.includes("long")) {
      suggestedQuestions.push("How long does this process usually take?");
    }
    if (!content_lower.includes("document")) {
      suggestedQuestions.push("What documents do I need to prepare?");
    }
  }

  // Default follow-ups if no specific context was detected or not enough suggestions
  if (suggestedQuestions.length < 2) {
    const defaultOptions = [
      "Tell me more about the market trends",
      "What are common mistakes to avoid?",
      "What additional costs should I budget for?",
      "How can I get the best deal?",
      "What are the next steps in this process?",
    ];

    // Add default questions until we have at least 3 suggestions
    while (suggestedQuestions.length < 3) {
      const randomQuestion =
        defaultOptions[Math.floor(Math.random() * defaultOptions.length)];
      if (!suggestedQuestions.includes(randomQuestion)) {
        suggestedQuestions.push(randomQuestion);
      }
    }
  }

  // Limit to 3 suggestions and ensure they're different
  return [...new Set(suggestedQuestions)].slice(0, 3);
};

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
    const newMessages = [
      ...messages,
      { role: "user" as const, content: message },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    
    // Display the endpoint we're calling (for debugging)
    console.log('Calling API endpoint:', '/api/chat');

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
      });

      // Log response status to help debug
      console.log('API response status:', res.status);
      
      const data = await res.json();
      console.log('API response data:', data);

      if (res.ok) {
        setMessages([
          ...newMessages,
          { role: "assistant" as const, content: data.reply },
        ]);
      } else {
        // Show more specific error message when available
        const errorMessage = data.error 
          ? `Error: ${data.error}${data.details ? ` - ${data.details}` : ''}` 
          : "Sorry, I couldn't process your request. Please try again.";
          
        setMessages([
          ...newMessages,
          {
            role: "assistant" as const,
            content: errorMessage,
          },
        ]);
        console.error("API error:", data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content:
            "Sorry, there was an error processing your request. Please check the console for more details.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen lg:w-3xl mx-auto bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-sm px-4 py-3 flex items-center">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-800 font-bold mr-3">
          RE
        </div>
        <div>
          <h1 className="text-lg font-semibold">Real Estate Property Expert</h1>
          {/* <p className="text-xs text-gray-100">
            15+ Years of Property Expertise
          </p> */}
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-700 mt-10">
            <p className="font-bold text-xl mb-2">
              Welcome! I&apos;m your Singapore Real Estate Expert
            </p>
            <p className="text-sm mb-4">
              With over 15 years of experience in the Singapore property market,
              I&apos;m here to help with all your real estate needs.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3 mb-2">
              <button
                onClick={() =>
                  sendMessage(
                    "Tell me about the process of buying and selling property in Singapore"
                  )
                }
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm cursor-pointer transition-colors"
              >
                Buying & Selling
              </button>
              <button
                onClick={() =>
                  sendMessage(
                    "What makes a good property investment in Singapore right now?"
                  )
                }
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm cursor-pointer transition-colors"
              >
                Property Investment
              </button>
              <button
                onClick={() =>
                  sendMessage(
                    "Give me a current market analysis of Singapore's property market"
                  )
                }
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm cursor-pointer transition-colors"
              >
                Market Analysis
              </button>
              <button
                onClick={() =>
                  sendMessage(
                    "What are the best neighborhoods in Singapore for families?"
                  )
                }
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm cursor-pointer transition-colors"
              >
                Neighborhood Insights
              </button>
            </div>
            <p className="text-sm italic mt-3">
              How can I assist with your property journey today?
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-1">
            <div
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-700 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div
                    className="formatted-message"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(msg.content),
                    }}
                  />
                ) : (
                  msg.content
                )}
              </div>
            </div>

            {/* Dynamic follow-up suggestion buttons that change based on conversation context */}
            {msg.role === "assistant" && idx === messages.length - 1 && (
              <div className="flex flex-wrap justify-start gap-2 pl-2 mt-1">
                {getContextualFollowUps(msg.content).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(suggestion)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
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
