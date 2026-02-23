import ExcelJS from "exceljs";

export interface ParsedStudent {
  familyNameEn: string;
  firstNameEn: string;
  fullChineseName: string;
  gender: string;
  faculty: string;
  email: string;
  studentId: string;
  passportCountry: string;
  hasChinaBankAccount: boolean;
  telephone: string;
  specialRequest: string;
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
}

export interface ParseResult {
  students: ParsedStudent[];
  errors: ParseError[];
}

const REQUIRED_HEADERS = [
  "Family Name - EN",
  "First Name - EN",
  "Full Chinese Name (if applicable)",
  "Gender",
  "Faculty",
  "HKU student email address",
  "Student ID",
  "Passport issuing country/Region",
  "With Bank Account in China",
  "Telephone",
  "Special Request",
];

const HEADER_MAP: Record<string, keyof ParsedStudent> = {
  "Family Name - EN": "familyNameEn",
  "First Name - EN": "firstNameEn",
  "Full Chinese Name (if applicable)": "fullChineseName",
  Gender: "gender",
  Faculty: "faculty",
  "HKU student email address": "email",
  "Student ID": "studentId",
  "Passport issuing country/Region": "passportCountry",
  "With Bank Account in China": "hasChinaBankAccount",
  Telephone: "telephone",
  "Special Request": "specialRequest",
};

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && "text" in (val as Record<string, unknown>)) {
    return String((val as { text: string }).text).trim();
  }
  return String(val).trim();
}

export async function parseStudentsExcel(
  buffer: ArrayBuffer
): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { students: [], errors: [{ row: 0, field: "", message: "No worksheet found" }] };
  }

  // Validate headers
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = str(cell.value);
  });

  const missingHeaders = REQUIRED_HEADERS.filter(
    (h) => !headers.includes(h)
  );

  if (missingHeaders.length > 0) {
    return {
      students: [],
      errors: [
        {
          row: 1,
          field: "headers",
          message: `Missing required columns: ${missingHeaders.join(", ")}`,
        },
      ],
    };
  }

  // Build column index map
  const colMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    if (HEADER_MAP[h]) colMap[h] = idx;
  });

  const students: ParsedStudent[] = [];
  const errors: ParseError[] = [];

  for (let rowNum = 2; rowNum <= sheet.rowCount; rowNum++) {
    const row = sheet.getRow(rowNum);

    // Skip empty rows
    const emailVal = str(row.getCell(colMap["HKU student email address"]).value);
    if (!emailVal) continue;

    const student: ParsedStudent = {
      familyNameEn: "",
      firstNameEn: "",
      fullChineseName: "",
      gender: "",
      faculty: "",
      email: "",
      studentId: "",
      passportCountry: "",
      hasChinaBankAccount: false,
      telephone: "",
      specialRequest: "",
    };

    for (const [header, field] of Object.entries(HEADER_MAP)) {
      const cellVal = row.getCell(colMap[header]).value;
      if (field === "hasChinaBankAccount") {
        const v = str(cellVal).toLowerCase();
        student.hasChinaBankAccount =
          v === "yes" || v === "true" || v === "1" || v === "y";
      } else {
        (student[field] as string) = str(cellVal);
      }
    }

    // Validate required fields
    if (!student.email) {
      errors.push({ row: rowNum, field: "email", message: "Email is required" });
    } else {
      const domain = student.email.split("@")[1]?.toLowerCase();
      if (domain !== "hku.hk" && domain !== "connect.hku.hk") {
        errors.push({
          row: rowNum,
          field: "email",
          message: "Email must be @hku.hk or @connect.hku.hk",
        });
      }
    }

    if (!student.familyNameEn) {
      errors.push({ row: rowNum, field: "familyNameEn", message: "Family name is required" });
    }

    if (!student.firstNameEn) {
      errors.push({ row: rowNum, field: "firstNameEn", message: "First name is required" });
    }

    students.push(student);
  }

  return { students, errors };
}
