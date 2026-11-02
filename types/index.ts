// ==============================================================================
// PROJECT NAIK (Summittact) - TYPESCRIPT DEFINITIONS V1
// Tipe data terpusat untuk Master Data, Transaksi Trip, dan Estimasi Biaya
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. Master Data Types
// ------------------------------------------------------------------------------

export type MountainDifficulty = "mudah" | "sedang" | "sulit";

export interface Mountain {
  id: string;
  name: string;
  island: string;
  province: string;
  elevation: number; // Ketinggian dalam mdpl
  difficulty: MountainDifficulty;
  description: string | null;
  estimated_duration: string | null;
  created_at: string;
  basecamps?: Basecamp[];
}

export interface Basecamp {
  id: string;
  mountain_id: string;
  name: string;
  latitude: number;
  longitude: number;
  ticket_fee: number | null; // Biaya simaksi / tiket per orang (Rp)
  parking_motorcycle: number | null; // Biaya parkir motor (Rp)
  parking_car: number | null; // Biaya parkir mobil (Rp)
  notes: string | null;
  created_at: string;
  mountain?: Mountain;
}

// ------------------------------------------------------------------------------
// 2. Transactional & Trip Types
// ------------------------------------------------------------------------------

export type VehicleType = "motor" | "mobil";

export interface Trip {
  id: string;
  title: string;
  basecamp_id: string | null;
  origin_city: string;
  vehicle_type: VehicleType;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  basecamp?: Basecamp;
  members?: Member[];
  expenses?: Expense[];
}

export interface Member {
  id: string;
  trip_id: string;
  name: string;
  created_at: string;
}

export type ExpenseCategory = "bbm" | "tol" | "tiket" | "parkir" | "logistik" | "lainnya";

export interface Expense {
  id: string;
  trip_id: string;
  payer_member_id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  is_shared: boolean;
  created_at: string;
  payer?: Member;
  participants?: ExpenseParticipant[];
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  member_id: string;
  created_at: string;
  member?: Member;
}

// ------------------------------------------------------------------------------
// 3. Calculation & Estimator Types
// ------------------------------------------------------------------------------

export interface TripCostEstimate {
  distance_km: number;
  round_trip: boolean; // default: true (pulang-pergi)
  fuel_cost: number;
  toll_cost: number;
  ticket_cost: number;
  parking_cost: number;
  logistics_cost: number;
  total_cost: number;
  member_count: number;
  cost_per_member: number;
}
