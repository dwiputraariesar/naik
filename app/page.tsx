"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Mountain } from "@/types";

export default function HomePage() {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProvince, setSelectedProvince] = useState<string>("Semua");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Semua");

  useEffect(() => {
    async function loadMountains() {
      try {
        setLoading(true);
        const res = await fetch("/api/mountains");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setMountains(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat data gunung:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMountains();
  }, []);

  // Filter daftar gunung berdasarkan provinsi dan tingkat kesulitan
  const filteredMountains = useMemo(() => {
    return mountains.filter((m) => {
      const matchProvince =
        selectedProvince === "Semua" || m.province === selectedProvince;
      const matchDifficulty =
        selectedDifficulty === "Semua" || m.difficulty === selectedDifficulty;
      return matchProvince && matchDifficulty;
    });
  }, [mountains, selectedProvince, selectedDifficulty]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ================================================================ */}
        {/* HERO SECTION */}
        {/* ================================================================ */}
        <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-emerald-50/50 via-white to-zinc-50 dark:border-zinc-800/80 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-950 py-16 sm:py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/80 dark:text-emerald-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Kalkulator & Estimator Pendakian Jawa V1</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
              Rencanakan & Estimasi Biaya Pendakian{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Tanpa Ribet.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hitung biaya bahan bakar kendaraan, tol, tiket simaksi basecamp,
              hingga pembagian patungan per anggota grup secara transparan dan akurat.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/planner"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <span>⚡ Hitung Estimasi Sekarang</span>
              </Link>
              <a
                href="#katalog-gunung"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
              >
                <span>🏔️ Lihat Gunung di Jawa</span>
              </a>
            </div>

            {/* Feature Highlights Quick Pill */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="text-lg">⛽</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  Hitung BBM PP
                </div>
                <div className="text-[11px] text-zinc-500">
                  Konsumsi motor & mobil
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="text-lg">🎟️</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  Simaksi & Parkir
                </div>
                <div className="text-[11px] text-zinc-500">
                  Info basecamp resmi
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="text-lg">👥</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  Split Bill Otomatis
                </div>
                <div className="text-[11px] text-zinc-500">
                  Biaya patungan per orang
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="text-lg">💸</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  Settlement Hutang
                </div>
                <div className="text-[11px] text-zinc-500">
                  Siapa bayar ke siapa
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* KATALOG GUNUNG SECTION */}
        {/* ================================================================ */}
        <section
          id="katalog-gunung"
          className="mx-auto max-w-5xl px-4 py-12 sm:py-16 sm:px-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <span>Eksplorasi Jalur Pendakian</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Destinasi Gunung di Pulau Jawa
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Data ketinggian, jalur basecamp, dan estimasi waktu tempuh untuk persiapan pendakianmu.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <option value="Semua">Semua Provinsi</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="Jawa Timur">Jawa Timur</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <option value="Semua">Semua Tingkat</option>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
          </div>

          {/* Grid Gunung */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl border border-zinc-200 bg-zinc-100 animate-pulse dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : filteredMountains.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">
                Tidak ada gunung yang cocok dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMountains.map((m) => {
                const difficultyBadgeClass =
                  m.difficulty === "mudah"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : m.difficulty === "sulit"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

                return (
                  <div
                    key={m.id}
                    className="group rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          📍 {m.province}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold capitalize ${difficultyBadgeClass}`}
                        >
                          {m.difficulty}
                        </span>
                      </div>

                      {/* Title & Elevation */}
                      <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        Gunung {m.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span>🏔️ {m.elevation.toLocaleString("id-ID")} mdpl</span>
                        {m.estimated_duration && (
                          <>
                            <span>•</span>
                            <span>⏱️ {m.estimated_duration}</span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {m.description || "Tidak ada deskripsi."}
                      </p>

                      {/* Basecamps Available */}
                      {m.basecamps && m.basecamps.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                            Jalur Basecamp:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.basecamps.map((b) => (
                              <span
                                key={b.id}
                                className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {b.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <Link
                        href="/planner"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2.5 text-xs font-bold text-zinc-800 hover:bg-emerald-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-emerald-600 dark:hover:text-white transition-all"
                      >
                        <span>Hitung Budget Trip</span>
                        <span>➔</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-8 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>NAIK (Summittact)</strong> — Estimator Budget & Rencana Pendakian Gunung Jawa.
          </div>
          <div>Dibuat dengan Next.js App Router, Tailwind CSS & Supabase.</div>
        </div>
      </footer>
    </div>
  );
}
