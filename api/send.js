// /api/send (pages/api/send.ts)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();

    console.log('Raw userId:', userId);
    console.log('Raw message:', message);

    const sanitized = sanitizeMessage(message);
    console.log('Sanitized:', sanitized);

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: sanitized,
          },
        ],
      }),
    });

    const data = await res.json();
    console.log('LINE API response:', data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unhandled Error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function sanitizeMessage(message: string): string {
  const sanitized = message
    .split('')
    .filter((char) => char.charCodeAt(0) <= 255)
    .join('');

  return sanitized || '（メッセージ内容なし）';
}
