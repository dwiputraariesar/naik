"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { Mountain, VehicleType } from "@/types";
import {
  calculateTripEstimate,
  calculateSettlement,
  FUEL_PRICES,
  FUEL_EFFICIENCY_KM_PER_LITER,
  MemberExpense,
} from "@/lib/calculations";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PlannerPage() {
  // ----------------------------------------------------------------------------
  // State: Master Data
  // ----------------------------------------------------------------------------
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [loadingMountains, setLoadingMountains] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ----------------------------------------------------------------------------
  // State: Form Perjalanan
  // ----------------------------------------------------------------------------
  const [selectedMountainId, setSelectedMountainId] = useState<string>("");
  const [selectedBasecampId, setSelectedBasecampId] = useState<string>("");

  const [originCity, setOriginCity] = useState<string>("Jakarta");
  const [vehicleType, setVehicleType] = useState<VehicleType>("mobil");
  const [fuelPrice, setFuelPrice] = useState<number>(FUEL_PRICES.pertalite);
  const [distanceKm, setDistanceKm] = useState<number>(180);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [tollCost, setTollCost] = useState<number>(85000);

  const [memberCount, setMemberCount] = useState<number>(4);
  const [logisticsPerPerson, setLogisticsPerPerson] = useState<number>(60000);

  // ----------------------------------------------------------------------------
  // State: Split Bill / Settlement Interaktif
  // ----------------------------------------------------------------------------
  const [showSettlement, setShowSettlement] = useState<boolean>(false);
  const [memberExpenses, setMemberExpenses] = useState<MemberExpense[]>([
    { memberId: "1", memberName: "Anggota 1", paidAmount: 0 },
    { memberId: "2", memberName: "Anggota 2", paidAmount: 0 },
    { memberId: "3", memberName: "Anggota 3", paidAmount: 0 },
    { memberId: "4", memberName: "Anggota 4", paidAmount: 0 },
  ]);

  // Helper untuk mengubah jumlah anggota sekaligus menyinkronkan data split bill
  const updateMemberCount = (newCount: number) => {
    const safeCount = Math.max(1, newCount);
    setMemberCount(safeCount);
    setMemberExpenses((prev) => {
      const updated = [...prev];
      if (safeCount > updated.length) {
        for (let i = updated.length + 1; i <= safeCount; i++) {
          updated.push({
            memberId: String(i),
            memberName: `Anggota ${i}`,
            paidAmount: 0,
          });
        }
      } else if (safeCount < updated.length) {
        return updated.slice(0, safeCount);
      }
      return updated;
    });
  };

  // ----------------------------------------------------------------------------
  // Fetch Data Gunung dari Backend API Route
  // ----------------------------------------------------------------------------
  useEffect(() => {
    async function loadMountains() {
      try {
        setLoadingMountains(true);
        const res = await fetch("/api/mountains");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setMountains(json.data);
          if (json.data.length > 0) {
            setSelectedMountainId(json.data[0].id);
            if (json.data[0].basecamps && json.data[0].basecamps.length > 0) {
              setSelectedBasecampId(json.data[0].basecamps[0].id);
            }
          }
        } else {
          setFetchError(json.error || "Gagal memuat data gunung.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Koneksi bermasalah.";
        setFetchError(msg);
      } finally {
        setLoadingMountains(false);
      }
    }

    loadMountains();
  }, []);

  // Gunung & Basecamp aktif
  const currentMountain = useMemo(() => {
    return mountains.find((m) => m.id === selectedMountainId);
  }, [mountains, selectedMountainId]);

  const currentBasecamp = useMemo(() => {
    if (!currentMountain?.basecamps) return undefined;
    return currentMountain.basecamps.find((b) => b.id === selectedBasecampId);
  }, [currentMountain, selectedBasecampId]);

  // Ganti basecamp otomatis saat ganti gunung
  const handleMountainChange = (mountainId: string) => {
    setSelectedMountainId(mountainId);
    const m = mountains.find((item) => item.id === mountainId);
    if (m?.basecamps && m.basecamps.length > 0) {
      setSelectedBasecampId(m.basecamps[0].id);
    } else {
      setSelectedBasecampId("");
    }
  };

  // ----------------------------------------------------------------------------
  // Perhitungan Estimasi Biaya (Live Reactive Calculation)
  // ----------------------------------------------------------------------------
  const estimate = useMemo(() => {
    return calculateTripEstimate({
      distanceKm: Number(distanceKm) || 0,
      isRoundTrip,
      vehicleType,
      memberCount: Number(memberCount) || 1,
      tollCost: vehicleType === "mobil" ? Number(tollCost) || 0 : 0,
      ticketFeePerPerson: currentBasecamp?.ticket_fee ?? 25000,
      parkingMotorcycle: currentBasecamp?.parking_motorcycle ?? 10000,
      parkingCar: currentBasecamp?.parking_car ?? 25000,
      vehicleCount: 1,
      logisticsPerPerson: Number(logisticsPerPerson) || 0,
      fuelPricePerLiter: fuelPrice,
      efficiencyKmPerLiter: FUEL_EFFICIENCY_KM_PER_LITER[vehicleType],
    });
  }, [
    distanceKm,
    isRoundTrip,
    vehicleType,
    memberCount,
    tollCost,
    currentBasecamp,
    logisticsPerPerson,
    fuelPrice,
  ]);

  // Kalkulasi settlement split bill
  const settlementResult = useMemo(() => {
    if (!showSettlement) return null;
    return calculateSettlement(memberExpenses);
  }, [showSettlement, memberExpenses]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 sm:px-6">
        {/* Header Judul Halaman */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold mb-2">
            <span>⚡ Kalkulator Budget Cepat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Estimasi Biaya Pendakian
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            Hitung perkiraan ongkos transportasi (BBM, Tol), tiket masuk simaksi, parkir, hingga patungan per orang.
          </p>
        </div>

        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <p className="font-semibold">Perhatian:</p>
            <p>{fetchError}</p>
          </div>
        )}

        {/* Layout Grid Responsif: Form (Kiri) & Live Summary (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================================================================ */}
          {/* FORM INPUT SECTION (KIRI - 7 Kolom pada Desktop) */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Pilihan Destinasi */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  1
                </span>
                <h2 className="font-bold text-base sm:text-lg">
                  Tujuan Gunung & Basecamp
                </h2>
              </div>

              {loadingMountains ? (
                <div className="py-6 text-center text-sm text-zinc-500 animate-pulse">
                  Memuat daftar gunung dari database...
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Select Gunung */}
                  <div>
                    <label
                      htmlFor="mountain-select"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5"
                    >
                      Pilih Gunung
                    </label>
                    <select
                      id="mountain-select"
                      value={selectedMountainId}
                      onChange={(e) => handleMountainChange(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800"
                    >
                      {mountains.map((m) => (
                        <option key={m.id} value={m.id}>
                          Gunung {m.name} ({m.elevation} mdpl) — {m.province}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Basecamp */}
                  <div>
                    <label
                      htmlFor="basecamp-select"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5"
                    >
                      Pilih Basecamp Jalur
                    </label>
                    <select
                      id="basecamp-select"
                      value={selectedBasecampId}
                      onChange={(e) => setSelectedBasecampId(e.target.value)}
                      disabled={!currentMountain?.basecamps?.length}
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800 disabled:opacity-60"
                    >
                      {currentMountain?.basecamps && currentMountain.basecamps.length > 0 ? (
                        currentMountain.basecamps.map((b) => (
                          <option key={b.id} value={b.id}>
                            Via Basecamp {b.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Basecamp tidak tersedia</option>
                      )}
                    </select>
                  </div>

                  {/* Info Badge Ringkas Basecamp Terpilih */}
                  {currentBasecamp && (
                    <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-emerald-900 dark:text-emerald-200 font-medium">
                        <span>
                          🎟️ Simaksi:{" "}
                          <strong>
                            {currentBasecamp.ticket_fee
                              ? formatRupiah(currentBasecamp.ticket_fee)
                              : "Rp 25.000 (estimasi)"}
                          </strong>
                          /org
                        </span>
                        <span>
                          🅿️ Parkir:{" "}
                          <strong>
                            {vehicleType === "mobil"
                              ? currentBasecamp.parking_car
                                ? formatRupiah(currentBasecamp.parking_car)
                                : "Rp 25.000"
                              : currentBasecamp.parking_motorcycle
                              ? formatRupiah(currentBasecamp.parking_motorcycle)
                              : "Rp 10.000"}
                          </strong>
                        </span>
                      </div>
                      {currentBasecamp.notes && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px] pt-1 border-t border-emerald-200/40 dark:border-emerald-900/30">
                          {currentBasecamp.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Step 2: Transportasi & Rute */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  2
                </span>
                <h2 className="font-bold text-base sm:text-lg">
                  Kendaraan & Jarak Perjalanan
                </h2>
              </div>

              <div className="mt-4 space-y-5">
                {/* Asal Kota */}
                <div>
                  <label
                    htmlFor="origin-city"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5"
                  >
                    Kota Keberangkatan
                  </label>
                  <input
                    id="origin-city"
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="Contoh: Jakarta, Surabaya, Semarang..."
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800"
                  />
                </div>

                {/* Jenis Kendaraan (Segmented Toggle) */}
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Jenis Kendaraan
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVehicleType("mobil")}
                      className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-sm font-semibold transition-all ${
                        vehicleType === "mobil"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <span className="text-lg">🚗</span>
                      <div className="text-left">
                        <div>Mobil</div>
                        <div className="text-[11px] font-normal opacity-80">
                          ~12 km / liter
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVehicleType("motor")}
                      className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-sm font-semibold transition-all ${
                        vehicleType === "motor"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <span className="text-lg">🛵</span>
                      <div className="text-left">
                        <div>Motor</div>
                        <div className="text-[11px] font-normal opacity-80">
                          ~40 km / liter
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Jenis BBM */}
                <div>
                  <label
                    htmlFor="fuel-type"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5"
                  >
                    Bahan Bakar (Harga / Liter)
                  </label>
                  <select
                    id="fuel-type"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800"
                  >
                    <option value={FUEL_PRICES.pertalite}>
                      Pertalite — {formatRupiah(FUEL_PRICES.pertalite)} / liter
                    </option>
                    <option value={FUEL_PRICES.pertamax}>
                      Pertamax — {formatRupiah(FUEL_PRICES.pertamax)} / liter
                    </option>
                    <option value={FUEL_PRICES.solar}>
                      Solar / Dexlite — {formatRupiah(FUEL_PRICES.solar)} / liter
                    </option>
                  </select>
                </div>

                {/* Jarak 1 Arah & Toggle Pulang-Pergi */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="distance-input"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                    >
                      Estimasi Jarak (1 Arah)
                    </label>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Total: {isRoundTrip ? distanceKm * 2 : distanceKm} km (PP)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="distance-input"
                        type="number"
                        min="1"
                        max="2000"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-3.5 py-2.5 pr-12 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800"
                      />
                      <span className="absolute right-3.5 top-2.5 text-sm text-zinc-400">
                        km
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsRoundTrip(!isRoundTrip)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isRoundTrip
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isRoundTrip ? "✓ Pulang-Pergi (x2)" : "1 Arah Saja"}
                    </button>
                  </div>

                  {/* Tombol Preset Jarak Cepat */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 self-center mr-1">
                      Preset:
                    </span>
                    {[75, 150, 250, 400].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDistanceKm(preset)}
                        className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {preset} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biaya Tol (Hanya aktif/tampil signifikan untuk mobil) */}
                {vehicleType === "mobil" && (
                  <div>
                    <label
                      htmlFor="toll-cost"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5"
                    >
                      Estimasi Biaya Tol (Total Pulang-Pergi)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm text-zinc-400 font-medium">
                        Rp
                      </span>
                      <input
                        id="toll-cost"
                        type="number"
                        min="0"
                        step="5000"
                        value={tollCost}
                        onChange={(e) => setTollCost(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 pl-11 pr-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: Rombongan & Logistik */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  3
                </span>
                <h2 className="font-bold text-base sm:text-lg">
                  Rombongan & Logistik
                </h2>
              </div>

              <div className="mt-4 space-y-5">
                {/* Counter Jumlah Anggota */}
                <div>
                  <label
                    htmlFor="member-count-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5"
                  >
                    Jumlah Anggota Pendakian
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Kurangi anggota"
                      onClick={() => updateMemberCount(memberCount - 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-100 text-lg font-bold text-zinc-700 hover:bg-zinc-200 active:scale-95 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      −
                    </button>
                    <input
                      id="member-count-input"
                      type="number"
                      min="1"
                      max="50"
                      value={memberCount}
                      onChange={(e) => updateMemberCount(Number(e.target.value))}
                      className="h-11 w-20 text-center rounded-xl border border-zinc-300 bg-zinc-50/50 text-base font-bold text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      aria-label="Tambah anggota"
                      onClick={() => updateMemberCount(memberCount + 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-100 text-lg font-bold text-zinc-700 hover:bg-zinc-200 active:scale-95 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      +
                    </button>
                    <span className="text-sm font-medium text-zinc-500">
                      orang (split bill)
                    </span>
                  </div>
                </div>

                {/* Logistik / Konsumsi per Orang */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="logistics-input"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                    >
                      Budget Logistik & Makan (per Orang)
                    </label>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Subtotal: {formatRupiah(memberCount * logisticsPerPerson)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm text-zinc-400 font-medium">
                      Rp
                    </span>
                    <input
                      id="logistics-input"
                      type="number"
                      min="0"
                      step="10000"
                      value={logisticsPerPerson}
                      onChange={(e) => setLogisticsPerPerson(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 pl-11 pr-3.5 py-2.5 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ================================================================ */}
          {/* LIVE SUMMARY CARD (KANAN - 5 Kolom pada Desktop, Sticky) */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-5 sm:p-6 shadow-xl shadow-emerald-950/5 dark:border-emerald-500/30 dark:bg-zinc-900">
              {/* Header Card Summary */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏔️</span>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      Gunung {currentMountain?.name || "..."}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Via Basecamp {currentBasecamp?.name || "..."}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {memberCount} Orang
                </span>
              </div>

              {/* Highlight Total & Per Orang */}
              <div className="my-5 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 p-4 sm:p-5 text-white shadow-md">
                <div className="text-xs font-medium uppercase tracking-wider text-emerald-100/90">
                  Estimasi Total Biaya Trip
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                  {formatRupiah(estimate.total_cost)}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-200">
                      Patungan / Orang
                    </span>
                    <div className="text-lg sm:text-xl font-bold">
                      {formatRupiah(estimate.cost_per_member)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-200/80">
                    dibagi rata {memberCount} anggota
                  </div>
                </div>
              </div>

              {/* Rincian Komponen Biaya */}
              <div className="space-y-2.5 text-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Rincian Biaya:
                </div>

                {/* BBM */}
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <span>⛽</span> Biaya BBM ({estimate.distance_km} km)
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(estimate.fuel_cost)}
                  </span>
                </div>

                {/* Tol */}
                {vehicleType === "mobil" && (
                  <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span>🛣️</span> Biaya Tol PP
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(estimate.toll_cost)}
                    </span>
                  </div>
                )}

                {/* Tiket Simaksi */}
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <span>🎟️</span> Tiket Simaksi ({memberCount} org)
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(estimate.ticket_cost)}
                  </span>
                </div>

                {/* Parkir */}
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <span>🅿️</span> Parkir Basecamp (1 {vehicleType})
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(estimate.parking_cost)}
                  </span>
                </div>

                {/* Logistik */}
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <span>🍲</span> Logistik & Konsumsi
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(estimate.logistics_cost)}
                  </span>
                </div>
              </div>

              {/* Tombol Toggle Fitur Split Bill & Settlement */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSettlement(!showSettlement)}
                  className="w-full flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>💸</span>
                    <span>Hitung Siapa Bayar Siapa (Settlement)</span>
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    {showSettlement ? "Tutup ▲" : "Buka ▼"}
                  </span>
                </button>
              </div>

              {/* Settlement Section (Tampil saat diaktifkan) */}
              {showSettlement && (
                <div className="mt-4 space-y-4 rounded-xl bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 text-xs">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Masukkan jumlah uang yang sudah ditalangi/dibayar oleh masing-masing anggota.
                    Sistem akan otomatis menghitung siapa yang harus mentransfer ke siapa.
                  </p>

                  <div className="space-y-2">
                    {memberExpenses.map((m, idx) => (
                      <div key={m.memberId} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={m.memberName}
                          onChange={(e) => {
                            const newExpenses = [...memberExpenses];
                            newExpenses[idx].memberName = e.target.value;
                            setMemberExpenses(newExpenses);
                          }}
                          className="w-28 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                        />
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1.5 text-zinc-400 text-xs">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="5000"
                            value={m.paidAmount}
                            onChange={(e) => {
                              const newExpenses = [...memberExpenses];
                              newExpenses[idx].paidAmount = Number(e.target.value) || 0;
                              setMemberExpenses(newExpenses);
                            }}
                            className="w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-2.5 py-1.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hasil Transfer Rekomendasi */}
                  {settlementResult && settlementResult.transfers.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">
                        Rekomendasi Transfer:
                      </div>
                      {settlementResult.transfers.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/50"
                        >
                          <span>
                            <strong>{t.fromName}</strong> ➔ transfer ke <strong>{t.toName}</strong>
                          </span>
                          <span className="font-bold">
                            {formatRupiah(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : settlementResult && settlementResult.totalSpent > 0 ? (
                    <div className="mt-2 text-center text-emerald-700 dark:text-emerald-400 font-semibold py-1">
                      🎉 Semua pembayaran sudah pas (lunas)!
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
