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
      content: "You are a helpful sales assistant. You handle queries about property, car, insurance, and medical center services.",
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
