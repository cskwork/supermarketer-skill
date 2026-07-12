import { isPlaceholder } from './utils.mjs';

export function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) return { data: null, body: normalized, raw: '' };
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) return { data: null, body: normalized, raw: '' };
  const raw = normalized.slice(4, end);
  const data = {};
  for (const line of raw.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const index = line.indexOf(':');
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: normalized.slice(end + 5), raw };
}

export function section(text, heading) {
  const normalized = text.replace(/\r\n?/g, '\n');
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const header = new RegExp(`^#{1,6}\\s+${escaped}\\s*$`, 'mi');
  const match = header.exec(normalized);
  if (!match) return null;
  const level = match[0].match(/^#+/)?.[0].length ?? 1;
  const start = match.index + match[0].length;
  const rest = normalized.slice(start);
  const next = new RegExp(`^#{1,${level}}\\s+`, 'm').exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}

export function allSections(text) {
  const normalized = text.replace(/\r\n?/g, '\n');
  const headings = [];
  const pattern = /^(#{1,6})\s+(.+?)\s*$/gm;
  let match;
  while ((match = pattern.exec(normalized)) !== null) {
    headings.push({ level: match[1].length, title: match[2], start: match.index, bodyStart: pattern.lastIndex });
  }
  return headings.map((heading, index) => {
    let end = normalized.length;
    for (let cursor = index + 1; cursor < headings.length; cursor += 1) {
      if (headings[cursor].level <= heading.level) {
        end = headings[cursor].start;
        break;
      }
    }
    return { ...heading, content: normalized.slice(heading.bodyStart, end).trim() };
  });
}

export function fieldValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^\\s*(?:[-*]\\s+)?${escaped}:\\s*(.+?)\\s*$`, 'mi');
  const match = pattern.exec(text);
  return match ? match[1].trim().replace(/^`|`$/g, '') : null;
}

export function checkboxes(text) {
  const results = [];
  const pattern = /^\s*[-*]\s+\[([ xX])\]\s+(.+?)\s*$/gm;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    results.push({ checked: match[1].toLowerCase() === 'x', text: match[2].trim(), index: match.index });
  }
  return results;
}

export function tableRows(text) {
  const rows = [];
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    const cells = trimmed.slice(1, -1).split('|').map((cell) => cell.trim());
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    rows.push(cells);
  }
  return rows;
}

export function meaningfulSection(text, heading) {
  const value = section(text, heading);
  if (value === null || isPlaceholder(value)) return null;
  const stripped = value.replace(/<!--[^]*?-->/g, '').trim();
  if (!stripped || /^[-*]\s*(?:<[^>]+>|)$/m.test(stripped) && stripped.split('\n').length === 1) return null;
  return stripped;
}

export function replaceField(text, label, value) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^(\\s*(?:[-*]\\s+)?${escaped}:\\s*).*$`, 'mi');
  if (pattern.test(text)) return text.replace(pattern, `$1${value}`);
  return text;
}

export function replaceSection(text, heading, newContent) {
  const normalized = text.replace(/\r\n?/g, '\n');
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const header = new RegExp(`^(#{1,6})\\s+${escaped}\\s*$`, 'mi');
  const match = header.exec(normalized);
  if (!match) return normalized;
  const level = match[1].length;
  const start = match.index + match[0].length;
  const rest = normalized.slice(start);
  const next = new RegExp(`^#{1,${level}}\\s+`, 'm').exec(rest);
  const end = next ? start + next.index : normalized.length;
  return `${normalized.slice(0, start)}\n\n${newContent.trim()}\n\n${normalized.slice(end).replace(/^\s+/, '')}`;
}

export function containsPlaceholders(text) {
  const findings = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('<!--')) return;
    if (/<(?:verbatim user request|business\/communication objective|approved docs|asset|criterion|assumption|question|finding|risk|[^>]{3,80})>/i.test(trimmed)) {
      findings.push({ line: index + 1, text: trimmed });
    }
    if (/\b(?:TODO|TBD|FILL ME)\b/i.test(trimmed)) findings.push({ line: index + 1, text: trimmed });
  });
  return findings;
}
