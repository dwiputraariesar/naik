-- ==============================================================================
-- PROJECT NAIK (Summittact) - DATABASE SCHEMA V1
-- Phase 1D: Initial 6 Tables Schema (Aligned with Phase 1C Final Schema)
-- ==============================================================================

-- 1. Extension untuk fungsi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Master Data: Mountains
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mountains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    island TEXT NOT NULL DEFAULT 'Jawa',
    province TEXT NOT NULL,
    elevation INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    description TEXT,
    estimated_duration TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. Master Data: Basecamps
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.basecamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mountain_id UUID NOT NULL REFERENCES public.mountains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ticket_fee INTEGER,
    parking_motorcycle INTEGER,
    parking_car INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. Transactional Data: Trips
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    basecamp_id UUID REFERENCES public.basecamps(id) ON DELETE SET NULL,
    origin_city TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. Transactional Data: Members
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. Transactional Data: Expenses
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    payer_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    is_shared BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. Junction Data: Expense Participants
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expense_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_expense_participant UNIQUE (expense_id, member_id)
);
