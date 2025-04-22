import { ReactNode } from "react";

// Define Message interface
export interface Message {
  role: "user" | "assistant";
  content: string;
}

// Helper function to generate highly dynamic and contextual follow-up questions based on conversation history
export const getContextualFollowUps = (latestContent: string, allMessages?: Message[]): string[] => {
  // Track topics, concepts and areas from previous messages
  const previousTopics = new Set<string>();
  const mentionedConcepts = new Set<string>();
  const discussedAreas = new Set<string>();
  
  if (allMessages && allMessages.length > 0) {
    // Use the last 4 messages for context (or fewer if there aren't 4)
    const recentMessages = allMessages.slice(Math.max(0, allMessages.length - 4));
    
    // Add all content to conversation context and extract topics
    recentMessages.forEach(msg => {
      const msgLower = msg.content.toLowerCase();
      
      // Extract property types
      if (msgLower.includes("hdb")) previousTopics.add("hdb");
      if (msgLower.includes("condo") || msgLower.includes("condominium")) previousTopics.add("condo");
      if (msgLower.includes("landed") || msgLower.includes("bungalow") || msgLower.includes("terrace")) 
        previousTopics.add("landed");
      
      // Extract concepts
      const conceptsToCheck = [
        "bto", "resale", "rental", "rent", "loan", "mortgage", "financing",
        "price", "cost", "eligibility", "agent", "commission", "negotiate",
        "grant", "subsidy", "tax", "stamp duty", "absd", "bsd", "renovation",
        "furnishing", "investment", "roi", "return", "yield", "capital gain",
        "cash flow", "lease", "freehold", "location", "neighborhood", "schools",
        "transport", "amenities", "facilities", "maintenance", "management fee"
      ];
      
      conceptsToCheck.forEach(concept => {
        if (msgLower.includes(concept)) mentionedConcepts.add(concept);
      });
      
      // Extract areas
      const areasToCheck = [
        "punggol", "tampines", "bedok", "jurong", "woodlands", "yishun",
        "ang mo kio", "toa payoh", "central", "east", "west", "north", "south",
        "bishan", "pasir ris", "clementi", "bukit timah", "novena", "queenstown",
        "geylang", "marine parade", "serangoon", "kallang", "tanjong pagar",
        "holland village", "bugis", "orchard", "sentosa", "cbd"
      ];
      
      areasToCheck.forEach(area => {
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
    if (latestLower.includes("landed") || latestLower.includes("bungalow") || 
latestLower.includes("terrace"))
      topics.push("landed");
    
    // Areas
    const areas = [
      "punggol", "tampines", "bedok", "jurong", "woodlands", "yishun",
      "ang mo kio", "toa payoh", "central", "east", "west", "north", "south",
      "bishan", "pasir ris", "clementi", "bukit timah", "novena", "queenstown"
    ];
    
    areas.forEach(area => {
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
    const allTopics = [...new Set([...latestTopics, ...Array.from(previousTopics)])];
    
    // Create a pool of potential questions based on all identified topics
    const questionPool: {question: string; priority: number}[] = [];
    
    // Add relevant follow-up questions based on the actual conversation
    
    // HDB related questions that extend the conversation in new directions
    if (allTopics.includes("hdb")) {
      // If BTO was discussed but not resale, ask about resale comparison
      if (mentionedConcepts.has("bto") && !mentionedConcepts.has("resale")) {
        questionPool.push({
          question: "How does BTO compare to resale HDB in terms of value?",
          priority: 8
        });
      }
      
      // If resale was discussed but not BTO, ask about BTO
      if (mentionedConcepts.has("resale") && !mentionedConcepts.has("bto")) {
        questionPool.push({
          question: "Should I consider BTO instead of resale?",
          priority: 8
        });
      }
      
      // If neither specific type was mentioned, ask about both
      if (!mentionedConcepts.has("bto") && !mentionedConcepts.has("resale")) {
        questionPool.push({
          question: "Which is better for me: BTO or resale HDB?",
          priority: 7 
        });
      }
      
      // If grants weren't specifically mentioned
      if (!mentionedConcepts.has("grant") && !mentionedConcepts.has("subsidy")) {
        questionPool.push({
          question: "What HDB grants am I eligible for?",
          priority: 9
        });
      }
      
      // If eligibility was mentioned but not fully addressed
      if (mentionedConcepts.has("eligibility")) {
        if (!latestLower.includes("income ceiling")) {
          questionPool.push({
            question: "What are the income ceiling requirements?",
            priority: 6
          });
        }
        
        if (!latestLower.includes("single")) {
          questionPool.push({
            question: "Can singles buy HDB flats?",
            priority: 5
          });
        }
      }
    }
    
    // Condo related questions
    if (allTopics.includes("condo")) {
      // If investment aspects weren't discussed
      if (!mentionedConcepts.has("investment") && !mentionedConcepts.has("roi")) {
        questionPool.push({
          question: "Are condos a good investment right now?",
          priority: 6
        });
      }
      
      // If maintenance fees weren't mentioned
      if (!latestLower.includes("maintenance") && !latestLower.includes("fee")) {
        questionPool.push({
          question: "What should I know about condo maintenance fees?",
          priority: 7
        });
      }
      
      // If we haven't discussed facilities
      if (!mentionedConcepts.has("facilities") && !mentionedConcepts.has("amenities")) {
        questionPool.push({
          question: "What facilities should I look for in a good condo?",
          priority: 5
        });
      }
      
      // If location comparison hasn't been discussed
      if (discussedAreas.size === 0) {
        questionPool.push({
          question: "Which areas have the best value for condos right now?",
          priority: 8
        });
      }
    }
    
    // Financing related questions
    if (allTopics.includes("financing") || mentionedConcepts.has("loan") || mentionedConcepts.has("mortgage")) {
      // If interest rates weren't discussed
      if (!latestLower.includes("interest") && !latestLower.includes("rate")) {
        questionPool.push({
          question: "What are the current interest rates for home loans?",
          priority: 8
        });
      }
      
      // If loan term wasn't discussed
      if (!latestLower.includes("term") && !latestLower.includes("tenure") && !latestLower.includes("duration")) {
        questionPool.push({
          question: "What loan tenure should I choose?",
          priority: 6
        });
      }
      
      // If down payment wasn't discussed
      if (!latestLower.includes("down payment") && !latestLower.includes("downpayment")) {
        questionPool.push({
          question: "How much down payment will I need?",
          priority: 9
        });
      }
      
      // If CPF usage wasn't discussed
      if (!latestLower.includes("cpf")) {
        questionPool.push({
          question: "How can I best utilize my CPF for property purchase?",
          priority: 7
        });
      }
      
      // If TDSR/MSR wasn't mentioned
      if (!latestLower.includes("tdsr") && !latestLower.includes("msr") && !latestLower.includes("debt")) {
        questionPool.push({
          question: "How do TDSR and MSR affect my loan eligibility?",
          priority: 5
        });
      }
    }
    
    // Investment related questions
    if (allTopics.includes("investment") || mentionedConcepts.has("investment") || mentionedConcepts.has("roi")) {
      // If rental yield wasn't discussed
      if (!latestLower.includes("rental yield") && !latestLower.includes("yield")) {
        questionPool.push({
          question: "Which areas have the best rental yields currently?",
          priority: 8
        });
        questionPool.push({
          question: "Which properties have high rental yield in Singapore?",
          priority: 7
        });
      }
      
      // If capital appreciation wasn't discussed
      if (!latestLower.includes("capital") && !latestLower.includes("appreciation")) {
        questionPool.push({
          question: "Which property types have the best capital appreciation?",
          priority: 7
        });
        questionPool.push({
          question: "Which condos have high en bloc potential?",
          priority: 6
        });
      }
      
      // If tax implications weren't discussed
      if (!mentionedConcepts.has("tax") && !mentionedConcepts.has("absd")) {
        questionPool.push({
          question: "What are the tax implications of property investment?",
          priority: 6
        });
        questionPool.push({
          question: "What are the additional buyer's stamp duties (ABSD)?",
          priority: 7
        });
        questionPool.push({
          question: "Can I buy a second property without ABSD?",
          priority: 6
        });
      }
      
      // General investment questions
      questionPool.push({
        question: "Is it a good time to buy property in Singapore 2025?",
        priority: 8
      });
      questionPool.push({
        question: "What is the best property to invest in Singapore?",
        priority: 7
      });
      questionPool.push({
        question: "Will property prices drop in 2025?",
        priority: 6
      });
      questionPool.push({
        question: "Should I wait for the market to cool before buying?",
        priority: 5
      });
      questionPool.push({
        question: "How to calculate rental yield in Singapore?",
        priority: 6
      });
    }
    
    // Area-specific questions
    const discussedAreasArray = Array.from(discussedAreas);
    if (discussedAreasArray.length > 0) {
      // Take the most recently mentioned area
      const mostRecentArea = discussedAreasArray[discussedAreasArray.length - 1];
      
      // If property prices in this area weren't specifically discussed
      if (!latestLower.includes(`${mostRecentArea} price`) && !latestLower.includes(`${mostRecentArea} cost`)) {
        questionPool.push({
          question: `What's the price range for properties in ${mostRecentArea}?`,
          priority: 8
        });
      }
      
      // If amenities weren't discussed
      if (!latestLower.includes(`${mostRecentArea} amenities`) && !latestLower.includes(`${mostRecentArea} facilities`)) {
        questionPool.push({
          question: `What amenities are available in ${mostRecentArea}?`,
          priority: 6
        });
      }
      
      // If transportation wasn't discussed
      if (!latestLower.includes(`${mostRecentArea} mrt`) && !latestLower.includes(`${mostRecentArea} transport`)) {
        questionPool.push({
          question: `How convenient is public transportation in ${mostRecentArea}?`,
          priority: 7
        });
        questionPool.push({
          question: "Where can I find affordable condos near MRT?",
          priority: 6
        });
        questionPool.push({
          question: "What condo is closest to MRT and mall?",
          priority: 5
        });
        questionPool.push({
          question: "Which property is near upcoming MRT lines?",
          priority: 5
        });
      }
      
      // If schools weren't discussed
      if (!latestLower.includes(`${mostRecentArea} school`)) {
        questionPool.push({
          question: `What are the good schools in ${mostRecentArea}?`,
          priority: 5
        });
        questionPool.push({
          question: "Which HDB towns have the best schools?",
          priority: 4
        });
      }
    }
    
    // General location questions if no specific area was discussed
    if (discussedAreasArray.length === 0) {
      questionPool.push({
        question: "Which area is best to buy property in Singapore?",
        priority: 8
      });
      questionPool.push({
        question: "Best area to invest in property in Singapore 2025?",
        priority: 7
      });
    }
    
    // Add questions about processes if mentioned but details weren't provided
    if (latestLower.includes("process") || latestLower.includes("procedure") || latestLower.includes("steps")) {
      // If timeline wasn't discussed
      if (!latestLower.includes("time") && !latestLower.includes("long") && !latestLower.includes("duration")) {
        questionPool.push({
          question: "How long does this process typically take?",
          priority: 8
        });
      }
      
      // If documents weren't discussed
      if (!latestLower.includes("document") && !latestLower.includes("paperwork")) {
        questionPool.push({
          question: "What documents do I need to prepare?",
          priority: 7
        });
      }
      
      // If costs weren't discussed
      if (!latestLower.includes("fee") && !latestLower.includes("cost")) {
        questionPool.push({
          question: "What fees are involved in this process?",
          priority: 6
        });
      }
    }
    
    // Add default generic questions with low priority as fallbacks
    const defaultQuestions = [
      { question: "What are the current market trends in Singapore?", priority: 3 },
      { question: "What common mistakes should I avoid?", priority: 3 },
      { question: "What hidden costs should I be aware of?", priority: 4 },
      { question: "How can I get the best deal?", priority: 2 },
      { question: "What are the next steps I should take?", priority: 2 },
      { question: "How will the property market change in the coming year?", priority: 3 },
      { question: "What neighborhoods are becoming popular?", priority: 4 }
    ];
    
    // Add default questions to the pool
    questionPool.push(...defaultQuestions);
    
    // Sort questions by priority (higher number = higher priority)
    questionPool.sort((a, b) => b.priority - a.priority);
    
    // Take only the highest priority questions (up to 3)
    const selectedQuestions = questionPool.slice(0, 7)
      .map(item => item.question);
    
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
    const questionPool: {question: string; priority: number}[] = [];
    
    // If no content or no conversation history, return default priority questions
    if (!latestContent || !allMessages) {
      return [
        "What are the steps to buy a property in Singapore?",
        "Can PRs or foreigners buy property in Singapore?",
        "How much downpayment do I need for a condo or HDB?"
      ];
    }
    
    // Extract mentioned property types from conversation history
    const mentionedHDB = latestContent.toLowerCase().includes('hdb') || 
                         (allMessages && allMessages.some(msg => msg.content.toLowerCase().includes('hdb')));
    const mentionedCondo = latestContent.toLowerCase().includes('condo') || 
                           (allMessages && allMessages.some(msg => msg.content.toLowerCase().includes('condo')));
    // Variable commented out as it's not used anywhere
    // const mentionedLanded = latestContent.toLowerCase().includes('landed') || 
    //                        (allMessages && allMessages.some(msg => msg.content.toLowerCase().includes('landed')));
    
    // Extract mentioned concepts from the conversation history
    const extractMentionedConcepts = () => {
      const concepts = new Set<string>();
      const allContent = allMessages ? allMessages.map(msg => msg.content.toLowerCase()).join(' ') : '';
      
      // Property types
      if (allContent.includes('bto')) concepts.add('bto');
      if (allContent.includes('resale')) concepts.add('resale');
      if (allContent.includes('executive condo') || allContent.includes('ec ')) concepts.add('ec');
      if (allContent.includes('freehold')) concepts.add('freehold');
      if (allContent.includes('leasehold')) concepts.add('leasehold');
      
      // Financial concepts
      if (allContent.includes('loan') || allContent.includes('mortgage')) concepts.add('loan');
      if (allContent.includes('downpayment') || allContent.includes('down payment')) concepts.add('downpayment');
      if (allContent.includes('cpf')) concepts.add('cpf');
      if (allContent.includes('grant') || allContent.includes('subsidy')) concepts.add('grant');
      if (allContent.includes('absd') || allContent.includes('stamp duty')) concepts.add('stamp_duty');
      
      // Buyer types
      if (allContent.includes('pr') || allContent.includes('permanent resident')) concepts.add('pr');
      if (allContent.includes('foreigner')) concepts.add('foreigner');
      if (allContent.includes('single')) concepts.add('single');
      if (allContent.includes('married') || allContent.includes('family')) concepts.add('family');
      
      // Property aspects
      if (allContent.includes('location') || allContent.includes('area') || allContent.includes('district')) concepts.add('location');
      if (allContent.includes('price') || allContent.includes('cost') || allContent.includes('afford')) concepts.add('price');
      if (allContent.includes('invest') || allContent.includes('roi') || allContent.includes('yield')) concepts.add('investment');
      if (allContent.includes('agent') || allContent.includes('commission')) concepts.add('agent');
      if (allContent.includes('process') || allContent.includes('procedure') || allContent.includes('step')) concepts.add('process');
      if (allContent.includes('sell') || allContent.includes('selling')) concepts.add('selling');
      if (allContent.includes('rent') || allContent.includes('lease') || allContent.includes('tenant')) concepts.add('renting');
      
      return concepts;
    };
    
    const mentionedConcepts = extractMentionedConcepts();
    
    // Now generate contextual questions based on what has been discussed
    
    // HDB related questions
    if (mentionedHDB) {
      // If BTO was discussed but not resale, ask about resale comparison
      if (mentionedConcepts.has('bto') && !mentionedConcepts.has('resale')) {
        questionPool.push({
          question: "How does BTO compare to resale HDB in terms of value?",
          priority: 9
        });
      }
      
      // If resale was discussed but not BTO, ask about BTO
      if (mentionedConcepts.has('resale') && !mentionedConcepts.has('bto')) {
        questionPool.push({
          question: "Should I consider BTO instead of resale?",
          priority: 9
        });
      }
      
      // If neither specific type was mentioned, ask about both
      if (!mentionedConcepts.has('bto') && !mentionedConcepts.has('resale')) {
        questionPool.push({
          question: "Which is better for me: BTO or resale HDB?",
          priority: 8 
        });
      }
      
      // If grants weren't specifically mentioned
      if (!mentionedConcepts.has('grant')) {
        questionPool.push({
          question: "What HDB grants am I eligible for?",
          priority: 7
        });
      }
      
      // If eligibility wasn't mentioned
      if (!mentionedConcepts.has('single') && !mentionedConcepts.has('family')) {
        questionPool.push({
          question: "Can singles buy a HDB flat?",
          priority: 6
        });
      }
    }
    
    // Condo related questions
    if (mentionedCondo) {
      // If EC wasn't discussed
      if (!mentionedConcepts.has('ec')) {
        questionPool.push({
          question: "What is Executive Condo (EC) and how is it different from condo?",
          priority: 8
        });
      }
      
      // If investment aspects weren't discussed
      if (!mentionedConcepts.has('investment')) {
        questionPool.push({
          question: "Are condos a good investment right now?",
          priority: 9
        });
      }
      
      // If location wasn't discussed
      if (!mentionedConcepts.has('location')) {
        questionPool.push({
          question: "Where can I find affordable condos near MRT?",
          priority: 7
        });
      }
      
      // If freehold/leasehold wasn't mentioned
      if (!mentionedConcepts.has('freehold') && !mentionedConcepts.has('leasehold')) {
        questionPool.push({
          question: "Is freehold better than leasehold?",
          priority: 6
        });
      }
    }
    
    // If neither condo nor HDB was specifically mentioned
    if (!mentionedHDB && !mentionedCondo) {
      questionPool.push({
        question: "Should I buy a condo or HDB?",
        priority: 9
      });
      questionPool.push({
        question: "What is the difference between HDB, EC, and condo?",
        priority: 8
      });
    }
    
    // Financial aspects
    if (!mentionedConcepts.has('downpayment')) {
      questionPool.push({
        question: "How much downpayment do I need for a condo or HDB?",
        priority: 9
      });
    }
    
    if (!mentionedConcepts.has('loan')) {
      questionPool.push({
        question: "How much can I borrow for a home loan in Singapore?",
        priority: 8
      });
    }
    
    if (!mentionedConcepts.has('cpf')) {
      questionPool.push({
        question: "How do I use my CPF to buy a house?",
        priority: 7
      });
    }
    
    // Eligibility for foreigners/PRs if not discussed
    if (!mentionedConcepts.has('pr') && !mentionedConcepts.has('foreigner')) {
      questionPool.push({
        question: "Can PRs or foreigners buy property in Singapore?",
        priority: 8
      });
    }
    
    // Process questions if not discussed
    if (!mentionedConcepts.has('process')) {
      questionPool.push({
        question: "What are the steps to buy a property in Singapore?",
        priority: 8
      });
    }
    
    if (!mentionedConcepts.has('agent')) {
      questionPool.push({
        question: "Do I need a property agent to buy a house?",
        priority: 7
      });
    }
    
    // Market/timing questions
    questionPool.push({
      question: "Is it a good time to buy property in Singapore 2025?",
      priority: 6
    });
    
    // Location questions if not discussed
    if (!mentionedConcepts.has('location')) {
      questionPool.push({
        question: "Which area is best to buy property in Singapore?",
        priority: 7
      });
    }
    
    // Select the top 3 questions by priority
    const sortedQuestions = questionPool
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(item => item.question);
    
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

// Helper function to format message content with proper rendering
export const formatMessageContent = (content: string): ReactNode => {
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
