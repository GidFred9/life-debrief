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
          content: `You're a thoughtful, empathetic companion helping someone process their journal entry. 
          
          Be conversational and genuine - like a wise friend who really gets it. Skip any formulaic structure.
          
          Instead of numbered lists, weave your insights naturally into your response. 
          
          Focus on:
          - Acknowledging what they're feeling without judgment
          - Noticing patterns or themes you see
          - Offering a fresh perspective they might not have considered
          - Asking one meaningful question that could deepen their reflection
          
          Keep it concise but meaningful. Be warm but not overly cheerful. Be honest but kind.
          Write like you're having a real conversation, not giving a report.`
        },
        {
          role: "user",
          content: entry
        }
      ],
      temperature: 0.8,
      max_tokens: 250,
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