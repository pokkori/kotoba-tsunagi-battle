import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = 'https://kotoba-tsunagi-battle.vercel.app';

export const metadata: Metadata = {
  title: '言葉つなぎバトル | Word Chain Arena',
  description: 'しりとりゲーム。15秒以内に次の単語を入力し、チェーンを伸ばせ！デイリーモードで全プレイヤー同一の開始語。Wordle風絵文字シェア対応。',
  keywords: ['しりとり', '言葉つなぎ', '単語ゲーム', '毎日チャレンジ', 'ブラウザゲーム', '無料ゲーム'],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: '言葉つなぎバトル | Word Chain Arena',
    description: 'しりとりゲーム。15秒以内に次の単語を入力し、チェーンを伸ばせ！',
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: '言葉つなぎバトル',
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: '言葉つなぎバトル - Word Chain Arena' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '言葉つなぎバトル | Word Chain Arena',
    description: 'しりとりゲーム。15秒以内に次の単語を入力し、チェーンを伸ばせ！',
    images: [`${SITE_URL}/api/og`],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D1117',
};


const _faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "このゲームは無料で遊べますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、基本プレイは完全無料でお楽しみいただけます。ブラウザから即座にプレイ開始できます。"
      }
    },
    {
      "@type": "Question",
      "name": "スマートフォンでも遊べますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、スマートフォン・タブレット・PCすべてに対応しています。ブラウザからそのままプレイできます。"
      }
    },
    {
      "@type": "Question",
      "name": "アプリのダウンロードは必要ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ダウンロード不要です。ブラウザを開いてアクセスするだけですぐに遊べます。"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(_faqLd) }}
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
