export const statuses = ['NUEVO','CONTACTADO','CALIFICADO','CITA_AGENDADA','CITA_HECHA','PROPUESTA','RESERVA','CIERRE','PERDIDO'] as const;

export function interpolateTemplate(body: string, values: Record<string, string | undefined>) {
  return body.replace(/\{(.*?)\}/g, (_, key: string) => values[key.trim()] ?? '');
}

export function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, '');
}

export function csvEscape(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function parseCsvLine(line: string) {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  out.push(current);
  return out;
}
