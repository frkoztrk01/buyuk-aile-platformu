/**
 * phpMyAdmin JSON plugin export: root is an array of chunks
 * `{ type: "table", name: "wpil_posts", data: [...] }`.
 */

export type WpJsonRow = Record<string, string | null>;

function cellToString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}

function columnNamesFromTableMeta(obj: Record<string, unknown>): string[] | undefined {
  const fields = obj.fields;
  if (Array.isArray(fields)) {
    const names: string[] = [];
    for (const f of fields) {
      if (f && typeof f === 'object' && 'name' in f && typeof (f as { name: unknown }).name === 'string') {
        names.push((f as { name: string }).name);
      }
    }
    if (names.length > 0) return names;
  }
  const cols = obj.columns;
  if (Array.isArray(cols) && cols.every((c) => typeof c === 'string')) {
    return cols as string[];
  }
  return undefined;
}

function normalizeRow(
  row: unknown,
  columns: string[] | undefined
): WpJsonRow {
  const out: WpJsonRow = {};
  if (row && typeof row === 'object' && !Array.isArray(row)) {
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      out[k.toLowerCase()] = cellToString(v);
    }
    return out;
  }
  if (Array.isArray(row) && columns && columns.length > 0) {
    for (let i = 0; i < columns.length; i++) {
      const key = columns[i].toLowerCase();
      out[key] = cellToString(row[i]);
    }
    return out;
  }
  return out;
}

/**
 * Parse the top-level phpMyAdmin JSON array into a map of table name → rows.
 */
export function parsePhpMyAdminJsonExport(raw: unknown): Map<string, WpJsonRow[]> {
  const map = new Map<string, WpJsonRow[]>();
  if (!Array.isArray(raw)) return map;
  for (const chunk of raw) {
    if (!chunk || typeof chunk !== 'object') continue;
    const obj = chunk as Record<string, unknown>;
    if (obj.type !== 'table' || typeof obj.name !== 'string') continue;
    const data = obj.data;
    if (!Array.isArray(data)) continue;
    const columns = columnNamesFromTableMeta(obj);
    const rows = data.map((row) => normalizeRow(row, columns));
    map.set(obj.name, rows);
  }
  return map;
}

/** Resolve `wpil_posts`-style physical table name from a logical fragment `posts`. */
export function getTable(
  tables: Map<string, WpJsonRow[]>,
  tablePrefix: string,
  logicalName: string
): WpJsonRow[] {
  const base = tablePrefix.endsWith('_') ? tablePrefix : `${tablePrefix}_`;
  const key = `${base}${logicalName}`;
  return tables.get(key) ?? [];
}
