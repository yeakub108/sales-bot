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
  
  // Function to dynamically generate responses based on user query context
  const handleLocalChatResponse = async (userMessage: string, currentMessages: Message[]) => {
    try {
      // Load knowledge base dynamically to keep responses fresh (can be extended with fetch from database/API)
      const knowledgeBase = {
        hdbGrants: {
          getInfo: async (query: string) => {
            // Dynamic response based on specific grant query keywords
            const isFamily = query.toLowerCase().includes('family');
            const isSingle = query.toLowerCase().includes('single');
            const isProximity = query.toLowerCase().includes('proxim') || query.toLowerCase().includes('near');
            const isStepUp = query.toLowerCase().includes('step') || query.toLowerCase().includes('upgrade');
            const isSenior = query.toLowerCase().includes('senior') || query.toLowerCase().includes('elderly');
            
            let response = `In Singapore, the Housing & Development Board (HDB) offers several housing grants tailored to different needs:

`;
            
            // Include details based on query context
            if (isFamily || (!isSingle && !isProximity && !isStepUp && !isSenior)) {
              response += `🏠 **Enhanced CPF Housing Grant (EHG) for Families**
- Amount: Up to $120,000
- Eligibility: First-time applicants with household income ceiling of $9,000
- At least one applicant must have worked continuously for 12 months
- Flat must have sufficient lease to cover youngest applicant until age 95

`;
            }
            
            if (isSingle || (!isFamily && !isProximity && !isStepUp && !isSenior)) {
              response += `👤 **Enhanced CPF Housing Grant (EHG) for Singles**
- Amount: Up to $60,000
- Eligibility: First-time singles aged 35+ with income ceiling of $4,500
- Must have worked continuously for 12 months
- Same lease sufficiency requirement as families

`;
            }
            
            if (isProximity || (!isFamily && !isSingle && !isStepUp && !isSenior)) {
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
            const isTrend = query.toLowerCase().includes('trend') || query.toLowerCase().includes('forecast');
            const isPrice = query.toLowerCase().includes('price') || query.toLowerCase().includes('cost');
            const isArea = query.toLowerCase().includes('area') || query.toLowerCase().includes('region') || query.toLowerCase().includes('district');
            const isRental = query.toLowerCase().includes('rent') || query.toLowerCase().includes('lease');
            
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
            const isLongTerm = query.toLowerCase().includes('long') || query.toLowerCase().includes('future');
            const isYield = query.toLowerCase().includes('yield') || query.toLowerCase().includes('rental') || query.toLowerCase().includes('income');
            const isTax = query.toLowerCase().includes('tax') || query.toLowerCase().includes('duty') || query.toLowerCase().includes('stamp');
            const isROI = query.toLowerCase().includes('roi') || query.toLowerCase().includes('return');
            
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
            const keywords = query.toLowerCase().split(' ');
            const topics = {
              buying: keywords.some(k => ['buy', 'purchase', 'acquire', 'get'].includes(k)),
              selling: keywords.some(k => ['sell', 'sale', 'selling', 'dispose'].includes(k)),
              neighborhood: keywords.some(k => ['area', 'neighborhood', 'district', 'location'].includes(k)),
              financing: keywords.some(k => ['loan', 'mortgage', 'finance', 'payment'].includes(k)),
              process: keywords.some(k => ['process', 'procedure', 'step', 'how'].includes(k)),
              legal: keywords.some(k => ['legal', 'law', 'regulation', 'rule'].includes(k)),
            };
            
            // Prioritize topics based on keyword matches
            const prioritizedTopics = Object.entries(topics)
              .filter(([, isMatched]) => isMatched)
              .map(([topic]) => topic);
            
            // Default topics if no specific matches found
            const topicsToAddress = prioritizedTopics.length > 0 ? 
              prioritizedTopics : ['buying', 'neighborhood', 'financing'];
            
            let response = `As a Singapore real estate expert, here's what you should know about `;
            response += topicsToAddress.join(', ') + `:

`;
            
            // Generate specific content for each identified topic
            if (topicsToAddress.includes('buying')) {
              response += `🏠 **Property Acquisition Process**
- HDB flats require eligibility checks (citizenship, income ceiling, family nucleus)
- Private properties have fewer restrictions but higher costs (esp. with ABSD)
- Typical process: property search → viewings → offer → option fee → exercise option → completion
- Timeline: 8-12 weeks for resale properties, 3-4 years for new launch (BTO/condo)

`;
            }
            
            if (topicsToAddress.includes('selling')) {
              response += `💼 **Selling Your Property**
- Consider timing, market conditions, and your onward housing plans
- Marketing options: engage agent (1-2% commission) or DIY platforms
- Prepare property (minor renovations, staging) to maximize value
- Tax implications: potential Seller's Stamp Duty if selling within 3 years

`;
            }
            
            if (topicsToAddress.includes('neighborhood')) {
              response += `📍 **Neighborhood Insights**
- Family-friendly: Tampines, Punggol, Pasir Ris (affordable); Bukit Timah, Holland V (premium)
- CBD proximity: Tanjong Pagar, River Valley, Tiong Bahru
- Investment potential: Woodlands (Malaysia proximity), Jurong East (regional center)
- Up-and-coming: Tengah (future eco-town), Paya Lebar (commercial hub development)

`;
            }
            
            if (topicsToAddress.includes('financing')) {
              response += `💰 **Financing Options**
- HDB loans: 2.6% interest, up to 80% LTV, uses CPF Ordinary Account funds
- Bank loans: 2.6-3.2% (variable), up to 75% LTV, potentially lower rates but fluctuating
- CPF usage: Ordinary Account can be used for down payment and monthly payments
- MSR (30%) and TDSR (55%) restrictions apply to loan qualification

`;
            }
            
            if (topicsToAddress.includes('process')) {
              response += `📋 **Key Process Steps**
1. Research and budgeting (incl. stamp duties, legal fees, agent commissions)
2. Property search and viewings (physical or virtual)
3. Negotiation and offer (verbal offer → OTP with 1% option fee)
4. Due diligence (legal, structural, financing approval)
5. Exercise option (additional 4% payment)
6. Completion (remaining 95%, handover of property)

`;
            }
            
            if (topicsToAddress.includes('legal')) {
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
      let responseContent = '';

      // Route to appropriate knowledge domain based on query analysis
      if (userMessageLower.includes('hdb') && (userMessageLower.includes('grant') || userMessageLower.includes('subsidy'))) {
        responseContent = await knowledgeBase.hdbGrants.getInfo(userMessage);
      } 
      else if (userMessageLower.includes('market') || userMessageLower.includes('trend') || userMessageLower.includes('price')) {
        responseContent = await knowledgeBase.propertyMarket.getInfo(userMessage);
      }
      else if (userMessageLower.includes('invest') || userMessageLower.includes('roi') || userMessageLower.includes('return')) {
        responseContent = await knowledgeBase.investment.getInfo(userMessage);
      }
      else {
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
              Welcome! I&apos;m your Singapore Real Estate Expert
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
