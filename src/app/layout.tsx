import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ほぐサウルス | デスクワーカーのための5分ケア",
  description:
    "首・肩・腰・眼精疲労を毎日5分のAIパーソナライズケアで解消。あなたの恐竜タイプを診断して、今日のケアを始めよう。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ backgroundColor: "#100C05" }}>
        {children}
      </body>
    </html>
  );
}
