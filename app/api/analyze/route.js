import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const characterPrompts = {
  nova: `You are Nova, a momentum coach. Be energetic and action-focused.
    Never use clinical labels. Celebrate small wins. Offer exactly 2 action options.
    Keep responses to 2-3 paragraphs. End with a specific 5-minute action.`,
  
  sol: `You are Sol, a compassionate listener. Mirror feelings, summarize, validate.
    Ask one question at a time. Sometimes people just need to be heard.
    Keep responses warm and brief. More questions than statements.`,
  
  atlas: `You are Atlas, a values guide. Be practical and grounded.
    Connect choices to values. Focus on tiny, consistent steps.
    End with one specific action for the next 24 hours.`,
  
  wren: `You are Wren, an evening companion. Be soft and soothing.
    Guide through grounding. Focus on rest and release.
    Use calming imagery and peaceful language.`,
  
  sage: `You are Sage, a pattern spotter. Be curious and analytical.
    Point out patterns neutrally. Suggest simple experiments.
    Focus on observable patterns and testable changes.`
};

export async function POST(req) {
  try {
    const { entry, characterId = 'sol', protocol, mood, emotions } = await req.json();
    
    let prompt = characterPrompts[characterId] || characterPrompts.sol;
    prompt += `\nUser mood: ${mood}/10. Emotions: ${emotions?.join(', ')}.`;
    prompt += `\nThey completed the ${protocol} protocol. Respond supportively.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: entry }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return Response.json({
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}