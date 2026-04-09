import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* ロゴ・タイトル */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🦕</div>
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "#D4A843" }}
        >
          ほぐサウルス
        </h1>
        <p className="text-sm tracking-widest uppercase opacity-60 mb-6">
          Hogsaurus
        </p>
        <p className="text-xl font-medium leading-relaxed" style={{ color: "#F5EDD8" }}>
          デスクワーカーの体を、
          <br />
          <span style={{ color: "#D4A843" }}>5分</span>で整える。
        </p>
      </div>

      {/* 特徴 */}
      <div className="grid grid-cols-3 gap-6 mb-12 text-center max-w-sm w-full">
        <div>
          <div className="text-2xl mb-1">🎯</div>
          <p className="text-xs opacity-70">16タイプ診断</p>
        </div>
        <div>
          <div className="text-2xl mb-1">🤖</div>
          <p className="text-xs opacity-70">AIケアプログラム</p>
        </div>
        <div>
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-xs opacity-70">毎日の習慣化</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/diagnosis"
        className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "#D4A843",
          color: "#100C05",
        }}
      >
        恐竜タイプを診断する →
      </Link>

      <p className="mt-6 text-xs opacity-40">
        4問・約1分で診断完了
      </p>

      {/* 装飾 */}
      <div className="fixed bottom-8 left-8 text-4xl opacity-10 rotate-[-15deg] select-none">
        🦖
      </div>
      <div className="fixed top-8 right-8 text-3xl opacity-10 rotate-[10deg] select-none">
        🦕
      </div>
    </main>
  );
}
