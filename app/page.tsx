export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">
          Hello World!
        </h1>
        <p className="text-2xl text-white/90">
          Welcome to your Next.js app deployed on Vercel
        </p>
        <div className="mt-4 rounded-lg bg-white/10 backdrop-blur-sm px-6 py-3">
          <p className="text-white/80 text-sm">
            Built with Next.js 15 + TypeScript + Tailwind CSS
          </p>
        </div>
      </main>
    </div>
  );
}
