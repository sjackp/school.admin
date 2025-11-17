// Simple helper script to clean student_enrollments.csv
// - Reads:  student_enrollments.csv  from the project root
// - Writes: student_enrollments_clean.csv with numeric fields normalized
//
// It converts values like "29.0" -> "29" for:
//   - seq_in_grade          (column index 10)
//   - age_october_days      (column index 16)
//   - age_october_months    (column index 17)
//   - age_october_years     (column index 18)

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "student_enrollments.csv");
const OUTPUT_FILE = path.join(__dirname, "student_enrollments_clean.csv");

if (!fs.existsSync(INPUT_FILE)) {
  console.error(`Input file not found: ${INPUT_FILE}`);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT_FILE, "utf8");
const lines = raw.split(/\r?\n/);

if (lines.length <= 1) {
  console.error("Input CSV appears to have no data rows.");
  process.exit(1);
}

const header = lines[0];
const outLines = [header];

function normalizeNumeric(value) {
  if (value === undefined || value === null) return value;
  const trimmed = String(value).trim();
  if (!trimmed) return trimmed;

  const num = Number(trimmed);
  if (Number.isNaN(num)) return trimmed;

  // Use integer representation (drop .0 etc.)
  return String(Number.isInteger(num) ? num : Math.round(num));
}

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue; // skip empty lines

  const cols = line.split(",");
  if (cols.length < 19) {
    // Unexpected row shape, keep as-is
    outLines.push(line);
    continue;
  }

  // seq_in_grade
  cols[10] = normalizeNumeric(cols[10]);
  // age_october_days, age_october_months, age_october_years
  cols[16] = normalizeNumeric(cols[16]);
  cols[17] = normalizeNumeric(cols[17]);
  cols[18] = normalizeNumeric(cols[18]);

  outLines.push(cols.join(","));
}

fs.writeFileSync(OUTPUT_FILE, outLines.join("\n"), "utf8");

console.log(`Wrote cleaned CSV to: ${OUTPUT_FILE}`);


