import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    // Log to help debug
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Send a simple response to verify configuration
    res.status(200).json({ status: "API key configured", keyPresent: !!process.env.OPENAI_API_KEY });
  } catch (error) {
    console.error('Error in test-openai:', error);
    res.status(500).json({ error: error.message });
  }
}
