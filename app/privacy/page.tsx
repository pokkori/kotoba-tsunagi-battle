import Link from 'next/link';

export const metadata = {
  title: 'プライバシーポリシー | 言葉つなぎバトル',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-6" style={{ background: 'linear-gradient(160deg, #0D1117 0%, #1a2236 60%, #0D1117 100%)' }}>
      <div className="max-w-2xl mx-auto" style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px' }}>
        <h1 className="text-2xl font-bold text-white mb-6">プライバシーポリシー</h1>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>
          <p style={{ marginBottom: '16px' }}>ポッコリラボ（以下「当社」）は、言葉つなぎバトルにおける個人情報の取扱いについて、以下の通りプライバシーポリシーを定めます。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#60a5fa' }}>1. 収集する情報</h2>
          <p style={{ marginBottom: '16px' }}>本サービスはサーバーへの個人情報送信を行いません。ゲームスコアや連続記録はすべてお客様のブラウザ（localStorage）に保存されます。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#60a5fa' }}>2. Cookieの使用</h2>
          <p style={{ marginBottom: '16px' }}>本サービスはCookieを使用しません。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#60a5fa' }}>3. 第三者提供</h2>
          <p style={{ marginBottom: '16px' }}>個人情報を第三者に提供することはありません。</p>
          <h2 style={{ fontWeight: 700, marginBottom: '8px', color: '#60a5fa' }}>4. お問い合わせ</h2>
          <p>X(Twitter) @levona_design へのDMにてご連絡ください。</p>
          <p style={{ marginTop: '24px', color: 'rgba(255,255,255,0.4)' }}>2026年3月25日 制定</p>
        </div>
        <div className="mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/" style={{ color: '#60a5fa' }} aria-label="ホームに戻る">ホームに戻る</Link>
          {' / '}
          <Link href="/legal" style={{ color: '#60a5fa' }} aria-label="特定商取引法に基づく表記を見る">特定商取引法</Link>
          {' / '}
          <Link href="/terms" style={{ color: '#60a5fa' }} aria-label="利用規約を見る">利用規約</Link>
        </div>
      </div>
    </main>
  );
}
