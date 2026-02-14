import { RecruitmentCounter } from "./counter.model";

function pad(num: number, width = 4) {
  return String(num).padStart(width, "0");
}

export function fmtYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

async function nextSeq(key: string) {
  const doc = await RecruitmentCounter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

/**
 * TEMP code based on interview date:
 * TMP-YYYYMMDD-0001
 */
export async function generateTempEmployeeCode(interviewDate: Date) {
  const dayKey = `TMP_${fmtYYYYMMDD(interviewDate)}`;
  const seq = await nextSeq(dayKey);
  return `TMP-${fmtYYYYMMDD(interviewDate)}-${pad(seq, 4)}`;
}

/**
 * FINAL code based on interview date:
 * EMP-YYYYMMDD-0001
 */
export async function generateEmployeeCode(interviewDate: Date) {
  const dayKey = `EMP_${fmtYYYYMMDD(interviewDate)}`;
  const seq = await nextSeq(dayKey);
  return `EMP-${fmtYYYYMMDD(interviewDate)}-${pad(seq, 4)}`;
}
