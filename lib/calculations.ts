// ==============================================================================
// PROJECT NAIK (Summittact) - CORE CALCULATION LOGIC
// Fungsi-fungsi murni (pure functions) untuk estimasi budget & split bill
// ==============================================================================

import { VehicleType, TripCostEstimate } from "@/types";

// ------------------------------------------------------------------------------
// Konstanta Default & Asumsi Perhitungan (Pulau Jawa)
// ------------------------------------------------------------------------------

export const FUEL_PRICES = {
  pertalite: 10000, // Rp 10.000 / liter
  pertamax: 13000,  // Rp 13.000 / liter
  solar: 14000,     // Rp 14.000 / liter
} as const;

export const FUEL_EFFICIENCY_KM_PER_LITER: Record<VehicleType, number> = {
  motor: 40, // Rata-rata motor bebek / matic: 40 km / liter
  mobil: 12, // Rata-rata mobil MPV / SUV bensin: 12 km / liter
};

// ------------------------------------------------------------------------------
// 1. Kalkulasi Biaya BBM
// ------------------------------------------------------------------------------

export interface FuelCalculationParams {
  distanceKm: number;
  isRoundTrip?: boolean; // Default true (pulang-pergi)
  vehicleType: VehicleType;
  fuelPricePerLiter?: number; // Default Pertalite (Rp 10.000)
  efficiencyKmPerLiter?: number; // Default sesuai tipe kendaraan
}

/**
 * Menghitung estimasi biaya BBM berdasarkan jarak, konsumsi bahan bakar, dan harga BBM.
 * Rumus: (Total Jarak / Efisiensi KM per Liter) * Harga per Liter
 */
export function calculateFuelCost({
  distanceKm,
  isRoundTrip = true,
  vehicleType,
  fuelPricePerLiter = FUEL_PRICES.pertalite,
  efficiencyKmPerLiter,
}: FuelCalculationParams): number {
  if (distanceKm <= 0) return 0;

  const totalDistance = isRoundTrip ? distanceKm * 2 : distanceKm;
  const efficiency =
    efficiencyKmPerLiter && efficiencyKmPerLiter > 0
      ? efficiencyKmPerLiter
      : FUEL_EFFICIENCY_KM_PER_LITER[vehicleType];

  const litersNeeded = totalDistance / efficiency;
  const totalCost = litersNeeded * fuelPricePerLiter;

  // Dibulatkan ke atas ke ratusan rupiah terdekat agar praktis
  return Math.ceil(totalCost / 100) * 100;
}

// ------------------------------------------------------------------------------
// 2. Kalkulasi Biaya Tiket Simaksi & Parkir Basecamp
// ------------------------------------------------------------------------------

export interface MountainFeeParams {
  memberCount: number;
  ticketFeePerPerson?: number | null; // Tarif per orang (Rp)
  vehicleType: VehicleType;
  parkingMotorcycle?: number | null; // Tarif parkir motor
  parkingCar?: number | null; // Tarif parkir mobil
  vehicleCount?: number; // Jumlah kendaraan (default 1)
}

/**
 * Menghitung estimasi biaya tiket simaksi dan parkir basecamp.
 */
export function calculateMountainFees({
  memberCount,
  ticketFeePerPerson = 25000, // Estimasi rata-rata jika data kosong: Rp 25.000/orang
  vehicleType,
  parkingMotorcycle = 10000, // Estimasi rata-rata parkir motor: Rp 10.000
  parkingCar = 25000, // Estimasi rata-rata parkir mobil: Rp 25.000
  vehicleCount = 1,
}: MountainFeeParams): { ticketTotal: number; parkingTotal: number } {
  const safeMemberCount = Math.max(1, memberCount);
  const safeVehicleCount = Math.max(1, vehicleCount);

  const ticketRate = ticketFeePerPerson ?? 25000;
  const ticketTotal = safeMemberCount * ticketRate;

  const parkingRate =
    vehicleType === "mobil"
      ? parkingCar ?? 25000
      : parkingMotorcycle ?? 10000;

  const parkingTotal = safeVehicleCount * parkingRate;

  return { ticketTotal, parkingTotal };
}

// ------------------------------------------------------------------------------
// 3. Kalkulasi Keseluruhan Budget Trip (Trip Estimator)
// ------------------------------------------------------------------------------

export interface TripEstimatorInput {
  distanceKm: number;
  isRoundTrip?: boolean;
  vehicleType: VehicleType;
  memberCount: number;
  tollCost?: number; // Estimasi biaya tol manual (Rp)
  ticketFeePerPerson?: number | null;
  parkingMotorcycle?: number | null;
  parkingCar?: number | null;
  vehicleCount?: number;
  logisticsPerPerson?: number; // Biaya logistik/makan per orang (Rp)
  fuelPricePerLiter?: number;
  efficiencyKmPerLiter?: number;
}

/**
 * Menghitung rincian total estimasi budget pendakian beserta biaya per orang.
 */
export function calculateTripEstimate({
  distanceKm,
  isRoundTrip = true,
  vehicleType,
  memberCount,
  tollCost = 0,
  ticketFeePerPerson,
  parkingMotorcycle,
  parkingCar,
  vehicleCount = 1,
  logisticsPerPerson = 0,
  fuelPricePerLiter,
  efficiencyKmPerLiter,
}: TripEstimatorInput): TripCostEstimate {
  const safeMemberCount = Math.max(1, memberCount);

  // 1. Hitung BBM
  const fuelCost = calculateFuelCost({
    distanceKm,
    isRoundTrip,
    vehicleType,
    fuelPricePerLiter,
    efficiencyKmPerLiter,
  });

  // 2. Hitung Tiket & Parkir Basecamp
  const { ticketTotal, parkingTotal } = calculateMountainFees({
    memberCount: safeMemberCount,
    ticketFeePerPerson,
    vehicleType,
    parkingMotorcycle,
    parkingCar,
    vehicleCount,
  });

  // 3. Biaya Tol & Logistik
  const totalToll = Math.max(0, tollCost);
  const totalLogistics = safeMemberCount * Math.max(0, logisticsPerPerson);

  // 4. Total Biaya
  const totalCost = fuelCost + totalToll + ticketTotal + parkingTotal + totalLogistics;
  const costPerMember = Math.ceil(totalCost / safeMemberCount);

  return {
    distance_km: isRoundTrip ? distanceKm * 2 : distanceKm,
    round_trip: isRoundTrip,
    fuel_cost: fuelCost,
    toll_cost: totalToll,
    ticket_cost: ticketTotal,
    parking_cost: parkingTotal,
    logistics_cost: totalLogistics,
    total_cost: totalCost,
    member_count: safeMemberCount,
    cost_per_member: costPerMember,
  };
}

// ------------------------------------------------------------------------------
// 4. Kalkulasi Split Bill & Settlement Sederhana (Siapa Bayar Siapa)
// ------------------------------------------------------------------------------

export interface MemberExpense {
  memberId: string;
  memberName: string;
  paidAmount: number; // Berapa yang sudah dibayarkan oleh member ini
}

export interface SettlementTransfer {
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amount: number;
}

/**
 * Menghitung pembagian rata (split bill) dan settlement transfer antar anggota.
 * Menghitung siapa yang membayar lebih dan siapa yang harus mentransfer ke siapa.
 */
export function calculateSettlement(
  members: MemberExpense[]
): {
  totalSpent: number;
  perPersonShare: number;
  transfers: SettlementTransfer[];
} {
  const memberCount = members.length;
  if (memberCount === 0) {
    return { totalSpent: 0, perPersonShare: 0, transfers: [] };
  }

  const totalSpent = members.reduce((sum, m) => sum + m.paidAmount, 0);
  const perPersonShare = Math.round(totalSpent / memberCount);

  // Hitung selisih balance masing-masing (positif = kelebihan bayar, negatif = kekurangan bayar)
  const balances = members.map((m) => ({
    memberId: m.memberId,
    name: m.memberName,
    balance: m.paidAmount - perPersonShare,
  }));

  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ ...b, balance: -b.balance })) // Jadikan positif untuk memudahkan perhitungan hutang
    .sort((a, b) => b.balance - a.balance);

  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const transfers: SettlementTransfer[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0) {
      transfers.push({
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amount: Math.round(amount),
      });

      debtor.balance -= amount;
      creditor.balance -= amount;
    }

    if (debtor.balance <= 0) dIdx++;
    if (creditor.balance <= 0) cIdx++;
  }

  return {
    totalSpent,
    perPersonShare,
    transfers,
  };
}
