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

// Helper function to generate highly dynamic and contextual follow-up questions based on conversation history
const getContextualFollowUps = (
  latestContent: string,
  allMessages?: Message[]
): string[] => {
  // Track topics, concepts and areas from previous messages
  const previousTopics = new Set<string>();
  const mentionedConcepts = new Set<string>();
  const discussedAreas = new Set<string>();

  if (allMessages && allMessages.length > 0) {
    // Use the last 4 messages for context (or fewer if there aren't 4)
    const recentMessages = allMessages.slice(
      Math.max(0, allMessages.length - 4)
    );

    // Add all content to conversation context and extract topics
    recentMessages.forEach((msg) => {
      const msgLower = msg.content.toLowerCase();

      // Extract property types
      if (msgLower.includes("hdb")) previousTopics.add("hdb");
      if (msgLower.includes("condo") || msgLower.includes("condominium"))
        previousTopics.add("condo");
      if (
        msgLower.includes("landed") ||
        msgLower.includes("bungalow") ||
        msgLower.includes("terrace")
      )
        previousTopics.add("landed");

      // Extract concepts
      const conceptsToCheck = [
        "bto",
        "resale",
        "rental",
        "rent",
        "loan",
        "mortgage",
        "financing",
        "price",
        "cost",
        "eligibility",
        "agent",
        "commission",
        "negotiate",
        "grant",
        "subsidy",
        "tax",
        "stamp duty",
        "absd",
        "bsd",
        "renovation",
        "furnishing",
        "investment",
        "roi",
        "return",
        "yield",
        "capital gain",
        "cash flow",
        "lease",
        "freehold",
        "location",
        "neighborhood",
        "schools",
        "transport",
        "amenities",
        "facilities",
        "maintenance",
        "management fee",
      ];

      conceptsToCheck.forEach((concept) => {
        if (msgLower.includes(concept)) mentionedConcepts.add(concept);
      });

      // Extract areas
      const areasToCheck = [
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
        "bishan",
        "pasir ris",
        "clementi",
        "bukit timah",
        "novena",
        "queenstown",
        "geylang",
        "marine parade",
        "serangoon",
        "kallang",
        "tanjong pagar",
        "holland village",
        "bugis",
        "orchard",
        "sentosa",
        "cbd",
      ];

      areasToCheck.forEach((area) => {
        if (msgLower.includes(area)) discussedAreas.add(area);
      });
    });
  }

  // Extract latest message topics
  const latestLower = latestContent.toLowerCase();
  const extractLatestTopics = () => {
    const topics = [];

    // Property types
    if (latestLower.includes("hdb")) topics.push("hdb");
    if (latestLower.includes("condo") || latestLower.includes("condominium"))
      topics.push("condo");
    if (
      latestLower.includes("landed") ||
      latestLower.includes("bungalow") ||
      latestLower.includes("terrace")
    )
      topics.push("landed");

    // Areas
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
      "bishan",
      "pasir ris",
      "clementi",
      "bukit timah",
      "novena",
      "queenstown",
    ];

    areas.forEach((area) => {
      if (latestLower.includes(area)) topics.push(area);
    });

    // Concepts
    if (latestLower.includes("bto")) topics.push("bto");
    if (latestLower.includes("resale")) topics.push("resale");
    if (latestLower.includes("rental") || latestLower.includes("rent"))
      topics.push("rental");
    if (latestLower.includes("loan") || latestLower.includes("mortgage"))
      topics.push("financing");
    if (latestLower.includes("price") || latestLower.includes("cost"))
      topics.push("pricing");
    if (latestLower.includes("eligibility")) topics.push("eligibility");
    if (latestLower.includes("agent") || latestLower.includes("commission"))
      topics.push("agent");
    if (latestLower.includes("negotiate")) topics.push("negotiation");
    if (latestLower.includes("grant") || latestLower.includes("subsidy"))
      topics.push("grants");
    if (latestLower.includes("investment") || latestLower.includes("roi"))
      topics.push("investment");

    return topics;
  };

  // Generate dynamic suggested questions
  const generateSuggestedQuestions = () => {
    const suggestedQuestions: string[] = [];
    const latestTopics = extractLatestTopics();

    // Get all topics from both current and previous messages
    const allTopics = [
      ...new Set([...latestTopics, ...Array.from(previousTopics)]),
    ];

    // Create a pool of potential questions based on all identified topics
    const questionPool: { question: string; priority: number }[] = [];

    // Add relevant follow-up questions based on the actual conversation

    // HDB related questions that extend the conversation in new directions
    if (allTopics.includes("hdb")) {
      // If BTO was discussed but not resale, ask about resale comparison
      if (mentionedConcepts.has("bto") && !mentionedConcepts.has("resale")) {
        questionPool.push({
          question: "How does BTO compare to resale HDB in terms of value?",
          priority: 8,
        });
      }

      // If resale was discussed but not BTO, ask about BTO
      if (mentionedConcepts.has("resale") && !mentionedConcepts.has("bto")) {
        questionPool.push({
          question: "Should I consider BTO instead of resale?",
          priority: 8,
        });
      }

      // If neither specific type was mentioned, ask about both
      if (!mentionedConcepts.has("bto") && !mentionedConcepts.has("resale")) {
        questionPool.push({
          question: "Which is better for me: BTO or resale HDB?",
          priority: 7,
        });
      }

      // If grants weren't specifically mentioned
      if (
        !mentionedConcepts.has("grant") &&
        !mentionedConcepts.has("subsidy")
      ) {
        questionPool.push({
          question: "What HDB grants am I eligible for?",
          priority: 9,
        });
      }

      // If eligibility was mentioned but not fully addressed
      if (mentionedConcepts.has("eligibility")) {
        if (!latestLower.includes("income ceiling")) {
          questionPool.push({
            question: "What are the income ceiling requirements?",
            priority: 6,
          });
        }

        if (!latestLower.includes("single")) {
          questionPool.push({
            question: "Can singles buy HDB flats?",
            priority: 5,
          });
        }
      }
    }

    // Condo related questions
    if (allTopics.includes("condo")) {
      // If investment aspects weren't discussed
      if (
        !mentionedConcepts.has("investment") &&
        !mentionedConcepts.has("roi")
      ) {
        questionPool.push({
          question: "Are condos a good investment right now?",
          priority: 6,
        });
      }

      // If maintenance fees weren't mentioned
      if (
        !latestLower.includes("maintenance") &&
        !latestLower.includes("fee")
      ) {
        questionPool.push({
          question: "What should I know about condo maintenance fees?",
          priority: 7,
        });
      }

      // If we haven't discussed facilities
      if (
        !mentionedConcepts.has("facilities") &&
        !mentionedConcepts.has("amenities")
      ) {
        questionPool.push({
          question: "What facilities should I look for in a good condo?",
          priority: 5,
        });
      }

      // If location comparison hasn't been discussed
      if (discussedAreas.size === 0) {
        questionPool.push({
          question: "Which areas have the best value for condos right now?",
          priority: 8,
        });
      }
    }

    // Financing related questions
    if (
      allTopics.includes("financing") ||
      mentionedConcepts.has("loan") ||
      mentionedConcepts.has("mortgage")
    ) {
      // If interest rates weren't discussed
      if (!latestLower.includes("interest") && !latestLower.includes("rate")) {
        questionPool.push({
          question: "What are the current interest rates for home loans?",
          priority: 8,
        });
      }

      // If loan term wasn't discussed
      if (
        !latestLower.includes("term") &&
        !latestLower.includes("tenure") &&
        !latestLower.includes("duration")
      ) {
        questionPool.push({
          question: "What loan tenure should I choose?",
          priority: 6,
        });
      }

      // If down payment wasn't discussed
      if (
        !latestLower.includes("down payment") &&
        !latestLower.includes("downpayment")
      ) {
        questionPool.push({
          question: "How much down payment will I need?",
          priority: 9,
        });
      }

      // If CPF usage wasn't discussed
      if (!latestLower.includes("cpf")) {
        questionPool.push({
          question: "How can I best utilize my CPF for property purchase?",
          priority: 7,
        });
      }

      // If TDSR/MSR wasn't mentioned
      if (
        !latestLower.includes("tdsr") &&
        !latestLower.includes("msr") &&
        !latestLower.includes("debt")
      ) {
        questionPool.push({
          question: "How do TDSR and MSR affect my loan eligibility?",
          priority: 5,
        });
      }
    }

    // Investment related questions
    if (
      allTopics.includes("investment") ||
      mentionedConcepts.has("investment") ||
      mentionedConcepts.has("roi")
    ) {
      // If rental yield wasn't discussed
      if (
        !latestLower.includes("rental yield") &&
        !latestLower.includes("yield")
      ) {
        questionPool.push({
          question: "Which areas have the best rental yields currently?",
          priority: 8,
        });
      }

      // If capital appreciation wasn't discussed
      if (
        !latestLower.includes("capital") &&
        !latestLower.includes("appreciation")
      ) {
        questionPool.push({
          question: "Which property types have the best capital appreciation?",
          priority: 7,
        });
      }

      // If tax implications weren't discussed
      if (!mentionedConcepts.has("tax") && !mentionedConcepts.has("absd")) {
        questionPool.push({
          question: "What are the tax implications of property investment?",
          priority: 6,
        });
      }
    }

    // Area-specific questions
    const discussedAreasArray = Array.from(discussedAreas);
    if (discussedAreasArray.length > 0) {
      // Take the most recently mentioned area
      const mostRecentArea =
        discussedAreasArray[discussedAreasArray.length - 1];

      // If property prices in this area weren't specifically discussed
      if (
        !latestLower.includes(`${mostRecentArea} price`) &&
        !latestLower.includes(`${mostRecentArea} cost`)
      ) {
        questionPool.push({
          question: `What's the price range for properties in ${mostRecentArea}?`,
          priority: 8,
        });
      }

      // If amenities weren't discussed
      if (
        !latestLower.includes(`${mostRecentArea} amenities`) &&
        !latestLower.includes(`${mostRecentArea} facilities`)
      ) {
        questionPool.push({
          question: `What amenities are available in ${mostRecentArea}?`,
          priority: 6,
        });
      }

      // If transportation wasn't discussed
      if (
        !latestLower.includes(`${mostRecentArea} mrt`) &&
        !latestLower.includes(`${mostRecentArea} transport`)
      ) {
        questionPool.push({
          question: `How convenient is public transportation in ${mostRecentArea}?`,
          priority: 7,
        });
      }

      // If schools weren't discussed
      if (!latestLower.includes(`${mostRecentArea} school`)) {
        questionPool.push({
          question: `What are the good schools in ${mostRecentArea}?`,
          priority: 5,
        });
      }
    }

    // Add questions about processes if mentioned but details weren't provided
    if (
      latestLower.includes("process") ||
      latestLower.includes("procedure") ||
      latestLower.includes("steps")
    ) {
      // If timeline wasn't discussed
      if (
        !latestLower.includes("time") &&
        !latestLower.includes("long") &&
        !latestLower.includes("duration")
      ) {
        questionPool.push({
          question: "How long does this process typically take?",
          priority: 8,
        });
      }

      // If documents weren't discussed
      if (
        !latestLower.includes("document") &&
        !latestLower.includes("paperwork")
      ) {
        questionPool.push({
          question: "What documents do I need to prepare?",
          priority: 7,
        });
      }

      // If costs weren't discussed
      if (!latestLower.includes("fee") && !latestLower.includes("cost")) {
        questionPool.push({
          question: "What fees are involved in this process?",
          priority: 6,
        });
      }
    }

    // Add default generic questions with low priority as fallbacks
    const defaultQuestions = [
      {
        question: "What are the current market trends in Singapore?",
        priority: 3,
      },
      { question: "What common mistakes should I avoid?", priority: 3 },
      { question: "What hidden costs should I be aware of?", priority: 4 },
      { question: "How can I get the best deal?", priority: 2 },
      { question: "What are the next steps I should take?", priority: 2 },
      {
        question: "How will the property market change in the coming year?",
        priority: 3,
      },
      { question: "What neighborhoods are becoming popular?", priority: 4 },
    ];

    // Add default questions to the pool
    questionPool.push(...defaultQuestions);

    // Sort questions by priority (higher number = higher priority)
    questionPool.sort((a, b) => b.priority - a.priority);

    // Take only the highest priority questions (up to 3)
    const selectedQuestions = questionPool
      .slice(0, 7)
      .map((item) => item.question);

    // Randomly select 3 questions from the top 7 to create variety
    while (suggestedQuestions.length < 3 && selectedQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * selectedQuestions.length);
      const question = selectedQuestions.splice(randomIndex, 1)[0];
      if (!suggestedQuestions.includes(question)) {
        suggestedQuestions.push(question);
      }
    }

    return suggestedQuestions;
  };

  // Check if we can generate property-specific questions based on the conversation context
  const getPropertySpecificQuestions = () => {
    // Create a question pool with priority ratings
    const questionPool: { question: string; priority: number }[] = [];

    // If no content or no conversation history, return default priority questions
    if (!latestContent || !allMessages) {
      return [
        "What are the steps to buy a property in Singapore?",
        "Can PRs or foreigners buy property in Singapore?",
        "How much downpayment do I need for a condo or HDB?",
      ];
    }

    // Extract mentioned property types from conversation history
    const mentionedHDB =
      latestContent.toLowerCase().includes("hdb") ||
      (allMessages &&
        allMessages.some((msg) => msg.content.toLowerCase().includes("hdb")));
    const mentionedCondo =
      latestContent.toLowerCase().includes("condo") ||
      (allMessages &&
        allMessages.some((msg) => msg.content.toLowerCase().includes("condo")));
    // Variable commented out as it's not used anywhere
    // const mentionedLanded =
    //   latestContent.toLowerCase().includes("landed") ||
    //   (allMessages &&
    //     allMessages.some((msg) =>
    //       msg.content.toLowerCase().includes("landed")
    //     ));

    // Extract mentioned concepts from the conversation history
    const extractMentionedConcepts = () => {
      const concepts = new Set<string>();
      const allContent = allMessages
        ? allMessages.map((msg) => msg.content.toLowerCase()).join(" ")
        : "";

      // Property types
      if (allContent.includes("bto")) concepts.add("bto");
      if (allContent.includes("resale")) concepts.add("resale");
      if (allContent.includes("executive condo") || allContent.includes("ec "))
        concepts.add("ec");
      if (allContent.includes("freehold")) concepts.add("freehold");
      if (allContent.includes("leasehold")) concepts.add("leasehold");

      // Financial concepts
      if (allContent.includes("loan") || allContent.includes("mortgage"))
        concepts.add("loan");
      if (
        allContent.includes("downpayment") ||
        allContent.includes("down payment")
      )
        concepts.add("downpayment");
      if (allContent.includes("cpf")) concepts.add("cpf");
      if (allContent.includes("grant") || allContent.includes("subsidy"))
        concepts.add("grant");
      if (allContent.includes("absd") || allContent.includes("stamp duty"))
        concepts.add("stamp_duty");

      // Buyer types
      if (
        allContent.includes("pr") ||
        allContent.includes("permanent resident")
      )
        concepts.add("pr");
      if (allContent.includes("foreigner")) concepts.add("foreigner");
      if (allContent.includes("single")) concepts.add("single");
      if (allContent.includes("married") || allContent.includes("family"))
        concepts.add("family");

      // Property aspects
      if (
        allContent.includes("location") ||
        allContent.includes("area") ||
        allContent.includes("district")
      )
        concepts.add("location");
      if (
        allContent.includes("price") ||
        allContent.includes("cost") ||
        allContent.includes("afford")
      )
        concepts.add("price");
      if (
        allContent.includes("invest") ||
        allContent.includes("roi") ||
        allContent.includes("yield")
      )
        concepts.add("investment");
      if (allContent.includes("agent") || allContent.includes("commission"))
        concepts.add("agent");
      if (
        allContent.includes("process") ||
        allContent.includes("procedure") ||
        allContent.includes("step")
      )
        concepts.add("process");
      if (allContent.includes("sell") || allContent.includes("selling"))
        concepts.add("selling");
      if (
        allContent.includes("rent") ||
        allContent.includes("lease") ||
        allContent.includes("tenant")
      )
        concepts.add("renting");

      return concepts;
    };

    const mentionedConcepts = extractMentionedConcepts();

    // Now generate contextual questions based on what has been discussed

    // HDB related questions
    if (mentionedHDB) {
      // If BTO was discussed but not resale, ask about resale comparison
      if (mentionedConcepts.has("bto") && !mentionedConcepts.has("resale")) {
        questionPool.push({
          question: "How does BTO compare to resale HDB in terms of value?",
          priority: 9,
        });
      }

      // If resale was discussed but not BTO, ask about BTO
      if (mentionedConcepts.has("resale") && !mentionedConcepts.has("bto")) {
        questionPool.push({
          question: "Should I consider BTO instead of resale?",
          priority: 9,
        });
      }

      // If neither specific type was mentioned, ask about both
      if (!mentionedConcepts.has("bto") && !mentionedConcepts.has("resale")) {
        questionPool.push({
          question: "Which is better for me: BTO or resale HDB?",
          priority: 8,
        });
      }

      // If grants weren't specifically mentioned
      if (!mentionedConcepts.has("grant")) {
        questionPool.push({
          question: "What HDB grants am I eligible for?",
          priority: 7,
        });
      }

      // If eligibility wasn't mentioned
      if (
        !mentionedConcepts.has("single") &&
        !mentionedConcepts.has("family")
      ) {
        questionPool.push({
          question: "Can singles buy a HDB flat?",
          priority: 6,
        });
      }
    }

    // Condo related questions
    if (mentionedCondo) {
      // If EC wasn't discussed
      if (!mentionedConcepts.has("ec")) {
        questionPool.push({
          question:
            "What is Executive Condo (EC) and how is it different from condo?",
          priority: 8,
        });
      }

      // If investment aspects weren't discussed
      if (!mentionedConcepts.has("investment")) {
        questionPool.push({
          question: "Are condos a good investment right now?",
          priority: 9,
        });
      }

      // If location wasn't discussed
      if (!mentionedConcepts.has("location")) {
        questionPool.push({
          question: "Where can I find affordable condos near MRT?",
          priority: 7,
        });
      }

      // If freehold/leasehold wasn't mentioned
      if (
        !mentionedConcepts.has("freehold") &&
        !mentionedConcepts.has("leasehold")
      ) {
        questionPool.push({
          question: "Is freehold better than leasehold?",
          priority: 6,
        });
      }
    }

    // If neither condo nor HDB was specifically mentioned
    if (!mentionedHDB && !mentionedCondo) {
      questionPool.push({
        question: "Should I buy a condo or HDB?",
        priority: 9,
      });
      questionPool.push({
        question: "What is the difference between HDB, EC, and condo?",
        priority: 8,
      });
    }

    // Financial aspects
    if (!mentionedConcepts.has("downpayment")) {
      questionPool.push({
        question: "How much downpayment do I need for a condo or HDB?",
        priority: 9,
      });
    }

    if (!mentionedConcepts.has("loan")) {
      questionPool.push({
        question: "How much can I borrow for a home loan in Singapore?",
        priority: 8,
      });
    }

    if (!mentionedConcepts.has("cpf")) {
      questionPool.push({
        question: "How do I use my CPF to buy a house?",
        priority: 7,
      });
    }

    // Eligibility for foreigners/PRs if not discussed
    if (!mentionedConcepts.has("pr") && !mentionedConcepts.has("foreigner")) {
      questionPool.push({
        question: "Can PRs or foreigners buy property in Singapore?",
        priority: 8,
      });
    }

    // Process questions if not discussed
    if (!mentionedConcepts.has("process")) {
      questionPool.push({
        question: "What are the steps to buy a property in Singapore?",
        priority: 8,
      });
    }

    if (!mentionedConcepts.has("agent")) {
      questionPool.push({
        question: "Do I need a property agent to buy a house?",
        priority: 7,
      });
    }

    // Market/timing questions
    questionPool.push({
      question: "Is it a good time to buy property in Singapore 2025?",
      priority: 6,
    });

    // Location questions if not discussed
    if (!mentionedConcepts.has("location")) {
      questionPool.push({
        question: "Which area is best to buy property in Singapore?",
        priority: 7,
      });
    }

    // Select the top 3 questions by priority
    const sortedQuestions = questionPool
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map((item) => item.question);

    return sortedQuestions;
  };

  // First attempt to generate property-specific contextual follow-ups
  const propertyQuestions = getPropertySpecificQuestions();
  if (propertyQuestions.length > 0) {
    return propertyQuestions;
  }

  // Fallback to the original contextual follow-up questions
  return generateSuggestedQuestions();
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

  // Function to dynamically generate responses based on user query context
  const handleLocalChatResponse = async (
    userMessage: string,
    currentMessages: Message[]
  ) => {
    try {
      // Load knowledge base dynamically to keep responses fresh (can be extended with fetch from database/API)
      const knowledgeBase = {
        hdbGrants: {
          getInfo: async (query: string) => {
            // Dynamic response based on specific grant query keywords
            const isFamily = query.toLowerCase().includes("family");
            const isSingle = query.toLowerCase().includes("single");
            const isProximity =
              query.toLowerCase().includes("proxim") ||
              query.toLowerCase().includes("near");
            const isStepUp =
              query.toLowerCase().includes("step") ||
              query.toLowerCase().includes("upgrade");
            const isSenior =
              query.toLowerCase().includes("senior") ||
              query.toLowerCase().includes("elderly");

            let response = `In Singapore, the Housing & Development Board (HDB) offers several housing grants tailored to different needs:

`;

            // Include details based on query context
            if (
              isFamily ||
              (!isSingle && !isProximity && !isStepUp && !isSenior)
            ) {
              response += `🏠 **Enhanced CPF Housing Grant (EHG) for Families**
- Amount: Up to $120,000
- Eligibility: First-time applicants with household income ceiling of $9,000
- At least one applicant must have worked continuously for 12 months
- Flat must have sufficient lease to cover youngest applicant until age 95

`;
            }

            if (
              isSingle ||
              (!isFamily && !isProximity && !isStepUp && !isSenior)
            ) {
              response += `👤 **Enhanced CPF Housing Grant (EHG) for Singles**
- Amount: Up to $60,000
- Eligibility: First-time singles aged 35+ with income ceiling of $4,500
- Must have worked continuously for 12 months
- Same lease sufficiency requirement as families

`;
            }

            if (
              isProximity ||
              (!isFamily && !isSingle && !isStepUp && !isSenior)
            ) {
              response += `🧭 **Proximity Housing Grant (PHG)**
- For Families: Up to $30,000 when living with/near parents/children (within 4km)
- For Singles: Up to $15,000 when living with/near parents (age 35+)
- At least one applicant must be a Singapore Citizen

`;
            }

            if (isStepUp) {
              response += `🔄 **Step-Up CPF Housing Grant**
- Amount: $15,000
- For second-timer families moving from 2-room to 3-room flat in non-mature estate
- Monthly household income ceiling: $7,000
- Employment requirements similar to EHG

`;
            }

            if (isSenior) {
              response += `👵 **Grants for Seniors**
- For Singapore Citizens aged 55+ buying short-lease 2-room Flexi flats
- Available grants include EHG, CPF Housing Grant, and PHG
- Special consideration for lease length and retirement adequacy

`;
            }

            // General information for comprehensive coverage
            response += `Additionally, the **CPF Housing Grant for Resale Flats** provides:
- For Families: $80,000 (2-4 room) or $50,000 (5-room+) with income ceiling of $14,000
- For Singles: $40,000 (2-4 room) or $25,000 (5-room) with income ceiling of $7,000

For the most up-to-date grant information and to check your specific eligibility, I recommend visiting the official HDB website or speaking with an HDB officer.`;

            return response;
          },
        },
        propertyMarket: {
          getInfo: async (query: string) => {
            // Dynamic response based on market query keywords
            const isTrend =
              query.toLowerCase().includes("trend") ||
              query.toLowerCase().includes("forecast");
            const isPrice =
              query.toLowerCase().includes("price") ||
              query.toLowerCase().includes("cost");
            const isArea =
              query.toLowerCase().includes("area") ||
              query.toLowerCase().includes("region") ||
              query.toLowerCase().includes("district");
            const isRental =
              query.toLowerCase().includes("rent") ||
              query.toLowerCase().includes("lease");

            let response = `The Singapore property market in ${new Date().getFullYear()} shows these key characteristics:

`;

            // Include details based on query context
            if (isTrend || (!isPrice && !isArea && !isRental)) {
              response += `📈 **Current Market Trends**
- HDB Resale: Moderate growth of 3-4% annually after the 2021-2023 surge
- Private Residential: Stable growth of 2-3% annually with luxury segment attracting foreign investors
- Government cooling measures continue to maintain market stability

`;
            }

            if (isPrice || (!isTrend && !isArea && !isRental)) {
              response += `💰 **Price Indicators**
- HDB Resale: Average prices range from $400K-$600K (3-room) to $700K-$1M+ (5-room)
- Private Condos: Entry-level from $1.2M-$1.8M, mid-tier $1.8M-$3M, luxury $3M+
- Landed Properties: Typically $3M+ for terrace houses, $5M+ for semi-detached, $8M+ for bungalows

`;
            }

            if (isArea || (!isTrend && !isPrice && !isRental)) {
              response += `📍 **Regional Hotspots**
- Emerging Areas: Jurong Lake District, Woodlands Regional Centre, Greater Southern Waterfront
- Mature Estates: Tampines, Bishan, Clementi continue to command premium prices
- Growth Corridors: Areas near upcoming MRT stations on Cross Island Line and Thomson-East Coast Line

`;
            }

            if (isRental || (!isTrend && !isPrice && !isArea)) {
              response += `🏘️ **Rental Market**
- Rental Yields: 3.0-3.5% for private properties, 4.0-4.5% for HDB flats
- High Demand Areas: CBD fringe (Tanjong Pagar, River Valley), East Coast, Novena
- Rental Rates: $2.5K-$3.5K for HDB, $3.5K-$5K for suburban condos, $5K-$8K+ for prime condos

`;
            }

            response += `The property market remains influenced by government policies, interest rates, and global economic conditions. For personalized advice based on your specific circumstances, consulting with a licensed property agent is recommended.`;

            return response;
          },
        },
        investment: {
          getInfo: async (query: string) => {
            // Generate dynamic investment advice based on query context
            const isLongTerm =
              query.toLowerCase().includes("long") ||
              query.toLowerCase().includes("future");
            const isYield =
              query.toLowerCase().includes("yield") ||
              query.toLowerCase().includes("rental") ||
              query.toLowerCase().includes("income");
            const isTax =
              query.toLowerCase().includes("tax") ||
              query.toLowerCase().includes("duty") ||
              query.toLowerCase().includes("stamp");
            const isROI =
              query.toLowerCase().includes("roi") ||
              query.toLowerCase().includes("return");

            let response = `For property investment in Singapore, consider these key strategies and insights:

`;

            if (isLongTerm || (!isYield && !isTax && !isROI)) {
              response += `🔎 **Long-term Capital Appreciation**
- Focus on properties near future infrastructure (e.g., Jurong Lake District, Paya Lebar Airbase redevelopment)
- Consider upcoming MRT lines and interchange stations (Cross Island Line, Thomson-East Coast Line)
- Look for areas with transformation masterplans (Greater Southern Waterfront, Punggol Digital District)

`;
            }

            if (isYield || (!isLongTerm && !isTax && !isROI)) {
              response += `💰 **Rental Income Strategy**
- Prime Districts (9, 10, 11): Strong expatriate demand but higher entry costs and lower yields (2.5-3%)
- City Fringe (Districts 5, 7, 15): Better balance of rental demand and yields (3-3.5%)
- HDB Rentals: Higher yields (4-4.5%) but with restrictions on minimum occupancy period

`;
            }

            if (isTax || (!isLongTerm && !isYield && !isROI)) {
              response += `📑 **Tax Considerations**
- Property Tax: 4% for owner-occupied properties, 10-20% for investment properties
- Additional Buyer's Stamp Duty (ABSD): 20% for Singapore Citizens buying second property, 30% for third+
- Seller's Stamp Duty (SSD): Up to 12% if selling within first year, tapering to 0% after 4th year

`;
            }

            if (isROI || (!isLongTerm && !isYield && !isTax)) {
              response += `📊 **Investment Returns**
- Historical Capital Appreciation: 3-5% annually over 10-year periods (varies by property type/location)
- Rental Yields: 2-4.5% depending on property type and location
- Total Returns (Appreciation + Yield): Typically 5-8% annually for well-selected properties
- Alternative: REITs offer 4-7% dividend yields with lower capital outlay and better liquidity

`;
            }

            response += `Every investment decision should consider your personal financial situation, risk tolerance, and investment horizon. Due diligence on specific properties and consulting with financial advisors is always recommended.`;

            return response;
          },
        },
        // Additional knowledge domains can be added here
        general: {
          getInfo: async (query: string) => {
            // Provide comprehensive answer based on query analysis
            const keywords = query.toLowerCase().split(" ");
            const topics = {
              buying: keywords.some((k) =>
                ["buy", "purchase", "acquire", "get"].includes(k)
              ),
              selling: keywords.some((k) =>
                ["sell", "sale", "selling", "dispose"].includes(k)
              ),
              neighborhood: keywords.some((k) =>
                ["area", "neighborhood", "district", "location"].includes(k)
              ),
              financing: keywords.some((k) =>
                ["loan", "mortgage", "finance", "payment"].includes(k)
              ),
              process: keywords.some((k) =>
                ["process", "procedure", "step", "how"].includes(k)
              ),
              legal: keywords.some((k) =>
                ["legal", "law", "regulation", "rule"].includes(k)
              ),
            };

            // Prioritize topics based on keyword matches
            const prioritizedTopics = Object.entries(topics)
              .filter(([, isMatched]) => isMatched)
              .map(([topic]) => topic);

            // Default topics if no specific matches found
            const topicsToAddress =
              prioritizedTopics.length > 0
                ? prioritizedTopics
                : ["buying", "neighborhood", "financing"];

            let response = `As a Singapore real estate expert, here's what you should know about `;
            response +=
              topicsToAddress.join(", ") +
              `:

`;

            // Generate specific content for each identified topic
            if (topicsToAddress.includes("buying")) {
              response += `🏠 **Property Acquisition Process**
- HDB flats require eligibility checks (citizenship, income ceiling, family nucleus)
- Private properties have fewer restrictions but higher costs (esp. with ABSD)
- Typical process: property search → viewings → offer → option fee → exercise option → completion
- Timeline: 8-12 weeks for resale properties, 3-4 years for new launch (BTO/condo)

`;
            }

            if (topicsToAddress.includes("selling")) {
              response += `💼 **Selling Your Property**
- Consider timing, market conditions, and your onward housing plans
- Marketing options: engage agent (1-2% commission) or DIY platforms
- Prepare property (minor renovations, staging) to maximize value
- Tax implications: potential Seller's Stamp Duty if selling within 3 years

`;
            }

            if (topicsToAddress.includes("neighborhood")) {
              response += `📍 **Neighborhood Insights**
- Family-friendly: Tampines, Punggol, Pasir Ris (affordable); Bukit Timah, Holland V (premium)
- CBD proximity: Tanjong Pagar, River Valley, Tiong Bahru
- Investment potential: Woodlands (Malaysia proximity), Jurong East (regional center)
- Up-and-coming: Tengah (future eco-town), Paya Lebar (commercial hub development)

`;
            }

            if (topicsToAddress.includes("financing")) {
              response += `💰 **Financing Options**
- HDB loans: 2.6% interest, up to 80% LTV, uses CPF Ordinary Account funds
- Bank loans: 2.6-3.2% (variable), up to 75% LTV, potentially lower rates but fluctuating
- CPF usage: Ordinary Account can be used for down payment and monthly payments
- MSR (30%) and TDSR (55%) restrictions apply to loan qualification

`;
            }

            if (topicsToAddress.includes("process")) {
              response += `📋 **Key Process Steps**
1. Research and budgeting (incl. stamp duties, legal fees, agent commissions)
2. Property search and viewings (physical or virtual)
3. Negotiation and offer (verbal offer → OTP with 1% option fee)
4. Due diligence (legal, structural, financing approval)
5. Exercise option (additional 4% payment)
6. Completion (remaining 95%, handover of property)

`;
            }

            if (topicsToAddress.includes("legal")) {
              response += `⚖️ **Legal Considerations**
- Foreign ownership restrictions (can buy condos but not HDB or most landed properties)
- Cooling measures (ABSD, TDSR, LTV limits)
- Minimum Occupation Period (MOP) of 5 years for HDB flats before selling/renting
- Conveyancing process requires lawyer ($2,500-5,000 in legal fees)

`;
            }

            // Add a personalized conclusion
            response += `I hope this information helps with your real estate decisions. If you have more specific questions about any aspect of Singapore property, feel free to ask!`;

            return response;
          },
        },
      };

      // Analyze user query to determine response category
      const userMessageLower = userMessage.toLowerCase();
      let responseContent = "";

      // Route to appropriate knowledge domain based on query analysis
      if (
        userMessageLower.includes("hdb") &&
        (userMessageLower.includes("grant") ||
          userMessageLower.includes("subsidy"))
      ) {
        responseContent = await knowledgeBase.hdbGrants.getInfo(userMessage);
      } else if (
        userMessageLower.includes("market") ||
        userMessageLower.includes("trend") ||
        userMessageLower.includes("price")
      ) {
        responseContent = await knowledgeBase.propertyMarket.getInfo(
          userMessage
        );
      } else if (
        userMessageLower.includes("invest") ||
        userMessageLower.includes("roi") ||
        userMessageLower.includes("return")
      ) {
        responseContent = await knowledgeBase.investment.getInfo(userMessage);
      } else {
        // Default to general knowledge with context-awareness
        responseContent = await knowledgeBase.general.getInfo(userMessage);
      }

      // Update messages with the dynamically generated response
      setMessages([
        ...currentMessages,
        {
          role: "assistant" as const,
          content: responseContent,
        },
      ]);
    } catch (err) {
      console.error("Error in local chat handling:", err);
      // Even our fallback has a fallback! This ensures we always give a useful response
      setMessages([
        ...currentMessages,
        {
          role: "assistant" as const,
          content: `As a Singapore real estate expert, I can tell you that the property market offers various opportunities from HDB flats to private condominiums and landed properties. Each has its own advantages in terms of location, pricing, and investment potential. Would you like to know more about a specific aspect of Singapore real estate?`,
        },
      ]);
    }
  };

  const sendMessage = async (message: string) => {
    const newMessages = [
      ...messages,
      { role: "user" as const, content: message },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    // Display the endpoint we're calling (for debugging)
    console.log("Calling API endpoint:", "/api/chat");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message, history: newMessages }),
      });

      // Log response status to help debug
      console.log("API response status:", res.status);

      const data = await res.json();
      console.log("API response data:", data);

      if (res.ok) {
        setMessages([
          ...newMessages,
          { role: "assistant" as const, content: data.reply },
        ]);
      } else {
        // Show more specific error message when available
        const errorMessage = data.error
          ? `Error: ${data.error}${data.details ? ` - ${data.details}` : ""}`
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

      // Try to handle the request locally if API fails
      handleLocalChatResponse(message, newMessages);
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
              Welcome! I&apos;m your Singapore Real Estate Property Expert
            </p>
            {/* <p className="text-sm mb-4">
              With over 15 years of experience in the Singapore property market,
              I&apos;m here to help with all your real estate needs.
            </p> */}
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
                {getContextualFollowUps(msg.content, messages).map(
                  (suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
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
