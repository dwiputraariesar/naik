import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ==============================================================================
// GET /api/mountains
// Mengambil daftar gunung beserta basecamp pendakiannya dari Supabase
// Opsional: ?id=<uuid> untuk mengambil satu data gunung spesifik
// ==============================================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("mountains")
        .select("*, basecamps(*)")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    // Ambil semua gunung diurutkan berdasarkan ketinggian (tertinggi ke terendah)
    const { data, error } = await supabase
      .from("mountains")
      .select("*, basecamps(*)")
      .order("elevation", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
