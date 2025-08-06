// /api/send.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();

    const sanitized = sanitizeMessage(message);

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unhandled Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function sanitizeMessage(message: string): string {
  if (!message || typeof message !== 'string') return '（メッセージなし）';
  return message.normalize('NFC').trim();
}
