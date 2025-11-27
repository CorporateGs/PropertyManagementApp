import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, context } = await req.json();

  const systemPrompt = `You are an AI assistant for a property management system. You help property managers with:
- Answering questions about tenants, units, and buildings
- Providing insights on financial data and reports
- Assisting with maintenance scheduling and tracking
- Helping with compliance and regulatory requirements
- Generating reports and summaries
- Automating routine tasks
- Providing recommendations based on data analysis

Context: ${context || 'General property management assistance'}

Be helpful, professional, and provide actionable advice.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from AI service');
    }
    
    return NextResponse.json({
      message: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}