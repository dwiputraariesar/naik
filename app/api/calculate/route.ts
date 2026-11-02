import { NextResponse } from "next/server";
import { calculateTripEstimate, TripEstimatorInput } from "@/lib/calculations";

// ==============================================================================
// POST /api/calculate
// Endpoint backend untuk menghitung estimasi biaya perjalanan pendakian
// ==============================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      distanceKm,
      isRoundTrip = true,
      vehicleType = "mobil",
      memberCount = 1,
      tollCost = 0,
      ticketFeePerPerson,
      parkingMotorcycle,
      parkingCar,
      vehicleCount = 1,
      logisticsPerPerson = 0,
      fuelPricePerLiter,
      efficiencyKmPerLiter,
    } = body;

    if (distanceKm === undefined || distanceKm === null || isNaN(Number(distanceKm))) {
      return NextResponse.json(
        { success: false, error: "Jarak (distanceKm) wajib diisi dan berupa angka." },
        { status: 400 }
      );
    }

    const input: TripEstimatorInput = {
      distanceKm: Number(distanceKm),
      isRoundTrip: Boolean(isRoundTrip),
      vehicleType: vehicleType === "motor" ? "motor" : "mobil",
      memberCount: Number(memberCount) > 0 ? Number(memberCount) : 1,
      tollCost: Number(tollCost) || 0,
      ticketFeePerPerson: ticketFeePerPerson !== undefined && ticketFeePerPerson !== null ? Number(ticketFeePerPerson) : undefined,
      parkingMotorcycle: parkingMotorcycle !== undefined && parkingMotorcycle !== null ? Number(parkingMotorcycle) : undefined,
      parkingCar: parkingCar !== undefined && parkingCar !== null ? Number(parkingCar) : undefined,
      vehicleCount: Number(vehicleCount) > 0 ? Number(vehicleCount) : 1,
      logisticsPerPerson: Number(logisticsPerPerson) || 0,
      fuelPricePerLiter: fuelPricePerLiter ? Number(fuelPricePerLiter) : undefined,
      efficiencyKmPerLiter: efficiencyKmPerLiter ? Number(efficiencyKmPerLiter) : undefined,
    };

    const estimate = calculateTripEstimate(input);

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan kalkulasi server";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
