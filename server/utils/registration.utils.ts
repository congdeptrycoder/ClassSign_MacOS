import { dbAll } from './db.utils';

export async function getActiveRegistrationPeriod(expectedType: string) {
  const rows = await dbAll<any>(
    `
      SELECT id, semester, period_type, start_date, end_date, is_active
      FROM academic_periods
      WHERE is_active = 1
      ORDER BY id DESC
    `
  );

  const now = new Date();
  return rows.find(row => {
    const start = new Date(String(row.start_date).replace(' ', 'T'));
    const end = new Date(String(row.end_date).replace(' ', 'T'));
    return row.period_type === expectedType && now >= start && now <= end;
  }) ?? null;
}

export function parseSchedule(detailStr: string): Array<{ day: string, periods: number[] }> {
  try {
    const parsed = JSON.parse(detailStr || '{}');
    let slots = [];
    if (Array.isArray(parsed)) slots = parsed;
    else if (parsed.slots && Array.isArray(parsed.slots)) slots = parsed.slots;
    
    if (slots.length > 0) {
      return slots.map((s: any) => ({
        day: String(s.day).replace('T', ''),
        periods: Array.isArray(s.periods) ? s.periods.map(Number) : [Number(s.period)]
      }));
    } else if (parsed.thu && parsed.tiet_bd && parsed.tiet_kt) {
      const start = Number(parsed.tiet_bd);
      const end = Number(parsed.tiet_kt);
      const periods = [];
      for(let i = start; i <= end; i++) periods.push(i);
      return [{
        day: String(parsed.thu),
        periods
      }];
    }
  } catch {}
  return [];
}
