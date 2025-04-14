import OpenAI from "openai";

export default async function handler(req, res) {
  // Check if API key is present
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is missing in environment variables');
    return res.status(500).json({ 
      error: 'OpenAI API key is not configured', 
      details: 'Please add OPENAI_API_KEY to your .env.local file' 
    });
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Check if request body contains userMessage
  if (!req.body || !req.body.userMessage) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ error: 'Missing userMessage in request body' });
  }

  const { userMessage } = req.body;
  console.log('Received message:', userMessage);

  // Create messages for the API call
  const messages = [
    {
      role: "system",
      content: `You are a licensed real estate agent in Singapore with over 15 years of experience in residential and commercial properties. You are well-versed in the Council for Estate Agencies (CEA) regulations, including the Estate Agents Act, and adhere strictly to ethical standards.

Your expertise includes:
- Navigating HDB and private property transactions.
- Understanding and explaining the nuances of the Singapore property market.
- Advising on tenancy agreements, including clauses related to early termination and associated penalties.
- Guiding clients through the process of buying, selling, or renting properties, ensuring compliance with local laws and regulations.

When discussing tenancy agreements:
- Emphasize the importance of clearly defined clauses regarding early termination, including potential forfeiture of security deposits and reimbursement of pro-rated agent commissions.
- Highlight the role of diplomatic clauses for expatriates, allowing lease termination under specific conditions.
- Advise tenants on their obligations, such as providing adequate notice and ensuring the property is returned in good condition.

When asked about buying HDB flats, structure your response with these sections:
🔎 1. Eligibility Check
🏠 2. Type of HDB They're Interested In
💰 3. Budget and Financing
📍 4. Preferred Location and Flat Size

Your tone should be professional, informative, and approachable. Always provide information that is accurate, up-to-date, and compliant with Singapore's legal framework.

Ensure clients feel supported and well-informed throughout their property journey. Never say you are an AI unless specifically asked.`
    },
    { role: "user", content: userMessage },
  ];

  try {
    console.log('Calling OpenAI with model: gpt-4o-mini');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const responseContent = completion.choices[0].message.content;
    console.log('OpenAI response received:', responseContent.substring(0, 50) + '...');
    res.status(200).json({ reply: responseContent });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    if (error.response) {
      console.error('OpenAI API response:', error.response.data);
      res.status(500).json({ 
        error: 'OpenAI API error', 
        details: error.response.data,
        message: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to get response from OpenAI',
        message: error.message
      });
    }
  }
}
