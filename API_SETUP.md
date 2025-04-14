# OpenAI API Key Setup

To get your Sales Chatbot working correctly, you need to configure your OpenAI API key.

## Steps:

1. Create or modify a file named `.env.local` in the root directory of your project
2. Add the following line to the file:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

3. Restart your development server after saving the file

## Error Troubleshooting

If you see a `500 (Internal Server Error)` when trying to send messages, it's likely due to:

1. Missing OpenAI API key in `.env.local` file
2. Invalid API key
3. API usage limits or restrictions

## Getting an OpenAI API Key

If you don't have an API key:

1. Go to [OpenAI's platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key

Note: Using the OpenAI API requires a payment method on file and comes with usage costs.
