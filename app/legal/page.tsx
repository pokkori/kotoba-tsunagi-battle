import Link from 'next/link';

export const metadata = {
  title: '特定商取引法に基づく表記 | 言葉つなぎバトル',
};

export default function LegalPage() {
  const rows = [
    ['販売業者', 'ポッコリラボ'],
    ['運営責任者', 'ポッコリラボ 代表 新美'],
    ['所在地', '〒475-0077 愛知県半田市元山町'],
    ['お問い合わせ', 'X(Twitter) @levona_design へのDM'],
    ['サービス内容', '言葉つなぎバトル しりとりゲーム（無料Webアプリ）'],
    ['提供時期', '申込み後即時提供'],
    ['料金', '無料（広告表示あり）'],
  ];

  return (
    <main className="min-h-screen p-6" style={{ background: 'linear-gradient(160deg, #0D1117 0%, #1a2236 60%, #0D1117 100%)' }}>
      <div className="max-w-2xl mx-auto" style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px' }}>
        <h1 className="text-2xl font-bold text-white mb-6">特定商取引法に基づく表記</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <tbody>
            {rows.map(([key, val]) => (
              <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '12px 0', fontWeight: 700, width: '40%', verticalAlign: 'top', color: '#60a5fa' }}>{key}</td>
                <td style={{ padding: '12px 0', color: 'rgba(255,255,255,0.7)' }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/" style={{ color: '#60a5fa' }} aria-label="ホームに戻る">ホームに戻る</Link>
          {' / '}
          <Link href="/privacy" style={{ color: '#60a5fa' }} aria-label="プライバシーポリシーを見る">プライバシーポリシー</Link>
          {' / '}
          <Link href="/terms" style={{ color: '#60a5fa' }} aria-label="利用規約を見る">利用規約</Link>
        </div>
      </div>
    </main>
  );
}
