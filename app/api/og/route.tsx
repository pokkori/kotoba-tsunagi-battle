import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chain = parseInt(searchParams.get('chain') || '0', 10);
  const score = parseInt(searchParams.get('score') || '0', 10);
  const mode = searchParams.get('mode') || 'daily';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>
          言葉つなぎバトル
        </div>
        <div style={{ fontSize: 32, opacity: 0.8, marginBottom: 40 }}>
          {mode === 'daily' ? '今日の結果' : 'フリープレイ'}
        </div>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 80, fontWeight: 'bold' }}>{chain}</div>
            <div style={{ fontSize: 24 }}>語</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 80, fontWeight: 'bold' }}>{score}</div>
            <div style={{ fontSize: 24 }}>pt</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
