import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompts = {
  therapy: `You're helping someone through a 'mindbloss' moment. Be warm, empathetic, and insightful. Focus on emotional patterns and personal growth. End with "Your mindbloss moment:" followed by a key insight.`,
  
  chat: `You're a helpful, friendly AI assistant having a natural conversation. Be conversational and genuine. Answer questions, explore ideas, or just chat naturally.`,
  
  resources: `Provide specific, actionable tips and resources. Be direct and solution-oriented. Format with numbered lists when appropriate. ALWAYS complete every point - never leave sentences unfinished.`,
  
  summary: `Analyze these journal entries and provide a comprehensive life summary with patterns, growth areas, and specific next steps.`
};

export async function POST(req) {
  try {
    const { entry, mode = 'reflection' } = await req.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompts[mode] || prompts.reflection
        },
        {
          role: "user",
          content: entry
        }
      ],
      temperature: mode === 'chat' ? 0.8 : 0.7,
      max_tokens: 500, // Increased to prevent cut-offs
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