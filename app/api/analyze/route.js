import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { entry, category } = await req.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an insightful journaling assistant. Analyze the user's journal entry and provide:
            1. A key insight about their situation
            2. A pattern you notice
            3. A specific, actionable step they should take
            4. A thought-provoking question for reflection
            Be direct, specific, and genuinely helpful. Avoid generic advice.`
        },
        {
          role: "user",
          content: `Category: ${category || 'general'}\n\nEntry: ${entry}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return Response.json({
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json(
      { error: 'Failed to analyze entry' },
      { status: 500 }
    );
  }
}