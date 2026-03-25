import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '言葉つなぎバトル | Word Chain Arena',
  description: 'しりとりゲーム。15秒以内に次の単語を入力し、チェーンを伸ばせ！デイリーモードで全プレイヤー同一の開始語。Wordle風絵文字シェア対応。',
  openGraph: {
    title: '言葉つなぎバトル | Word Chain Arena',
    description: 'しりとりゲーム。15秒以内に次の単語を入力し、チェーンを伸ばせ！',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
