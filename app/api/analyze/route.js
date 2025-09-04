import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prompts = {
  reflection: `You're helping someone with guided self-reflection. Be warm, empathetic, and insightful. Focus on identifying patterns and reframing thoughts constructively. Help them find actionable next steps. End with a key insight or gentle action they can take.`,
  
  chat: `You're a helpful, friendly AI assistant having a natural conversation. Be conversational and genuine. Answer questions, explore ideas, or just chat naturally.`,
  
  resources: `Provide specific, actionable tips and resources. Be direct and solution-oriented. Format with numbered lists when appropriate. ALWAYS complete every point - never leave sentences unfinished.`,
  
  summary: `Analyze these journal entries and provide a weekly recap with: key themes, emotional patterns, wins, helpful reframes, and 3 specific action steps.`
};

export async function POST(req) {
  try {
    const { entry, mode = 'reflection' } = await req.json();
    
    // Make sure we have a valid prompt
    const systemPrompt = prompts[mode] || prompts.reflection;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: entry
        }
      ],
      temperature: mode === 'chat' ? 0.8 : 0.7,
      max_tokens: 500,
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