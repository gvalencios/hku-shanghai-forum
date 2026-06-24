import ExcelJS from "exceljs";

export interface FlightLeg {
  date: string;
  time: string;
  flightNumber: string;
}

export interface ParsedTripInfo {
  email: string;
  studentId: string;
  // departureFlight = HKG → PVG (outbound, arriving in Shanghai)
  departureFlight: FlightLeg;
  // arrivalFlight = PVG → HKG (return, departing Shanghai)
  arrivalFlight: FlightLeg;
  visaStatus: string; // one of "" | not_started | in_progress | approved | not_required
  hasFlights: boolean;
  hasVisa: boolean;
}

export interface TripInfoParseError {
  row: number;
  field: string;
  message: string;
}

export interface TripInfoParseResult {
  rows: ParsedTripInfo[];
  errors: TripInfoParseError[];
}

// Column headers. Only `email` is required; everything else is optional so a file
// may carry flights, visa, or both.
export const TRIP_HEADERS = {
  email: "HKU student email address",
  studentId: "Student ID",
  depFlightNo: "Departure Flight No. (HKG→PVG)",
  depDate: "Departure Date",
  depTime: "Departure Time",
  retFlightNo: "Return Flight No. (PVG→HKG)",
  retDate: "Return Date",
  retTime: "Return Time",
  visaStatus: "Visa Status",
} as const;

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && "text" in (val as Record<string, unknown>)) {
    return String((val as { text: string }).text).trim();
  }
  return String(val).trim();
}

// Maps free-text / codebook values to the dashboard's visaStatus values.
// Returns "" when blank, or null when present-but-unrecognized.
export function normalizeVisaStatus(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  if (["1", "not_started", "not started", "application not started"].includes(v))
    return "not_started";
  if (["2", "in_progress", "in progress", "application in progress"].includes(v))
    return "in_progress";
  if (["3", "approved", "application approved"].includes(v)) return "approved";
  if (["4", "not_required", "not required"].includes(v) || v.includes("not required"))
    return "not_required";
  return null;
}

export async function parseTripInfoExcel(
  buffer: ArrayBuffer
): Promise<TripInfoParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { rows: [], errors: [{ row: 0, field: "", message: "No worksheet found" }] };
  }

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = str(cell.value);
  });

  if (!headers.includes(TRIP_HEADERS.email)) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          field: "headers",
          message: `Missing required column: ${TRIP_HEADERS.email}`,
        },
      ],
    };
  }

  const col: Record<string, number> = {};
  headers.forEach((h, idx) => {
    if (h) col[h] = idx;
  });
  const cell = (row: ExcelJS.Row, header: string) =>
    col[header] ? str(row.getCell(col[header]).value) : "";

  const rows: ParsedTripInfo[] = [];
  const errors: TripInfoParseError[] = [];

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);
    const email = cell(row, TRIP_HEADERS.email).toLowerCase();
    if (!email) continue; // skip empty rows

    const domain = email.split("@")[1]?.toLowerCase();
    if (domain !== "hku.hk" && domain !== "connect.hku.hk") {
      errors.push({
        row: rowNum,
        field: "email",
        message: "Email must be @hku.hk or @connect.hku.hk",
      });
    }

    const departureFlight: FlightLeg = {
      date: cell(row, TRIP_HEADERS.depDate),
      time: cell(row, TRIP_HEADERS.depTime),
      flightNumber: cell(row, TRIP_HEADERS.depFlightNo),
    };
    const arrivalFlight: FlightLeg = {
      date: cell(row, TRIP_HEADERS.retDate),
      time: cell(row, TRIP_HEADERS.retTime),
      flightNumber: cell(row, TRIP_HEADERS.retFlightNo),
    };
    const hasFlights = Boolean(
      departureFlight.flightNumber || arrivalFlight.flightNumber
    );

    const visaRaw = cell(row, TRIP_HEADERS.visaStatus);
    const visaStatus = normalizeVisaStatus(visaRaw);
    if (visaStatus === null) {
      errors.push({
        row: rowNum,
        field: "visaStatus",
        message: `Unrecognized visa status "${visaRaw}"`,
      });
    }

    rows.push({
      email,
      studentId: cell(row, TRIP_HEADERS.studentId),
      departureFlight,
      arrivalFlight,
      visaStatus: visaStatus ?? "",
      hasFlights,
      hasVisa: Boolean(visaStatus),
    });
  }

  return { rows, errors };
}
