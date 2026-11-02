import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/10 bg-white/80 backdrop-blur-md dark:border-emerald-500/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
              NAIK
            </span>
            <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Jawa V1
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/planner"
            className="px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
          >
            Kalkulator Trip
          </Link>
        </nav>
      </div>
    </header>
  );
}
