import { readText, writeTextAtomic } from './utils.mjs';

function stripInlineComment(input) {
  let single = false;
  let double = false;
  let escaped = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && double) {
      escaped = true;
      continue;
    }
    if (character === "'" && !double) single = !single;
    if (character === '"' && !single) double = !double;
    if (character === '#' && !single && !double && (index === 0 || /\s/.test(input[index - 1]))) {
      return input.slice(0, index).trimEnd();
    }
  }
  return input.trimEnd();
}

function splitTopLevel(input, delimiter = ',') {
  const parts = [];
  let current = '';
  let single = false;
  let double = false;
  let escaped = false;
  let square = 0;
  let curly = 0;
  for (const character of input) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === '\\' && double) {
      current += character;
      escaped = true;
      continue;
    }
    if (character === "'" && !double) single = !single;
    if (character === '"' && !single) double = !double;
    if (!single && !double) {
      if (character === '[') square += 1;
      if (character === ']') square -= 1;
      if (character === '{') curly += 1;
      if (character === '}') curly -= 1;
      if (character === delimiter && square === 0 && curly === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
    }
    current += character;
  }
  if (current.trim() || input.trim() === '') parts.push(current.trim());
  return parts;
}

function findMappingColon(input) {
  let single = false;
  let double = false;
  let escaped = false;
  let square = 0;
  let curly = 0;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && double) {
      escaped = true;
      continue;
    }
    if (character === "'" && !double) single = !single;
    if (character === '"' && !single) double = !double;
    if (!single && !double) {
      if (character === '[') square += 1;
      if (character === ']') square -= 1;
      if (character === '{') curly += 1;
      if (character === '}') curly -= 1;
      if (character === ':' && square === 0 && curly === 0) return index;
    }
  }
  return -1;
}

function parseQuoted(value) {
  if (value.startsWith('"')) return JSON.parse(value);
  return value.slice(1, -1).replace(/''/g, "'");
}

function parseScalar(raw) {
  const value = stripInlineComment(raw).trim();
  if (value === '') return '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return parseQuoted(value);
  }
  if (value === '[]') return [];
  if (value === '{}') return {};
  if (value.startsWith('[') && value.endsWith(']')) {
    const body = value.slice(1, -1).trim();
    if (!body) return [];
    return splitTopLevel(body).map(parseScalar);
  }
  if (value.startsWith('{') && value.endsWith('}')) {
    const body = value.slice(1, -1).trim();
    if (!body) return {};
    const object = {};
    for (const part of splitTopLevel(body)) {
      const colon = findMappingColon(part);
      if (colon < 0) throw new Error(`Invalid inline mapping entry: ${part}`);
      const key = parseKey(part.slice(0, colon).trim());
      object[key] = parseScalar(part.slice(colon + 1));
    }
    return object;
  }
  if (/^(null|~)$/i.test(value)) return null;
  if (/^true$/i.test(value)) return true;
  if (/^false$/i.test(value)) return false;
  if (/^[-+]?\d+$/.test(value)) return Number.parseInt(value, 10);
  if (/^[-+]?(?:\d+\.\d*|\d*\.\d+)(?:e[-+]?\d+)?$/i.test(value)) return Number(value);
  return value;
}

function parseKey(raw) {
  const key = raw.trim();
  if (!key) throw new Error('Empty YAML mapping key.');
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    return parseQuoted(key);
  }
  return key;
}

function tokenize(text) {
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const tokens = [];
  for (let index = 0; index < lines.length; index += 1) {
    const original = lines[index];
    if (/\t/.test(original.match(/^\s*/)?.[0] ?? '')) {
      throw new Error(`Tabs are not supported for YAML indentation (line ${index + 1}).`);
    }
    const trimmed = original.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed === '---' || trimmed === '...') continue;
    const indent = original.length - original.trimStart().length;
    tokens.push({ indent, content: original.trimStart(), line: index + 1, original });
  }
  return tokens;
}

function parseBlock(tokens, start, indent, sourceLines) {
  if (start >= tokens.length) return { value: null, next: start };
  const isSequence = tokens[start].indent === indent && /^-(?:\s|$)/.test(tokens[start].content);
  return isSequence
    ? parseSequence(tokens, start, indent, sourceLines)
    : parseMapping(tokens, start, indent, sourceLines);
}

function parseBlockScalar(tokens, tokenIndex, parentIndent, indicator, sourceLines) {
  const token = tokens[tokenIndex];
  const sourceIndex = token.line;
  const lines = [];
  let minimumIndent = null;
  for (let index = sourceIndex; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    if (!line.trim()) {
      lines.push('');
      continue;
    }
    const indent = line.length - line.trimStart().length;
    if (indent <= parentIndent) break;
    if (minimumIndent === null || indent < minimumIndent) minimumIndent = indent;
    lines.push(line);
  }
  const normalized = lines.map((line) => (line ? line.slice(minimumIndent ?? 0) : ''));
  let value = indicator.startsWith('>')
    ? normalized.join('\n').replace(/([^\n])\n([^\n])/g, '$1 $2')
    : normalized.join('\n');
  if (indicator.endsWith('-')) value = value.replace(/\n+$/g, '');
  else if (!indicator.endsWith('+')) value = `${value.replace(/\n+$/g, '')}\n`;
  let next = tokenIndex + 1;
  while (next < tokens.length && tokens[next].indent > parentIndent) next += 1;
  return { value, next };
}

function parseMapping(tokens, start, indent, sourceLines, seed = {}) {
  const object = seed;
  let index = start;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.indent < indent) break;
    if (token.indent > indent) {
      throw new Error(`Unexpected indentation at line ${token.line}.`);
    }
    if (/^-(?:\s|$)/.test(token.content)) break;
    const colon = findMappingColon(token.content);
    if (colon < 0) throw new Error(`Expected key: value at line ${token.line}.`);
    const key = parseKey(token.content.slice(0, colon));
    const rest = stripInlineComment(token.content.slice(colon + 1)).trim();
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      throw new Error(`Duplicate YAML key "${key}" at line ${token.line}.`);
    }
    if (rest === '|' || rest === '|-' || rest === '|+' || rest === '>' || rest === '>-' || rest === '>+') {
      const parsed = parseBlockScalar(tokens, index, indent, rest, sourceLines);
      object[key] = parsed.value;
      index = parsed.next;
      continue;
    }
    if (rest !== '') {
      object[key] = parseScalar(rest);
      index += 1;
      continue;
    }
    if (index + 1 < tokens.length && tokens[index + 1].indent > indent) {
      const parsed = parseBlock(tokens, index + 1, tokens[index + 1].indent, sourceLines);
      object[key] = parsed.value;
      index = parsed.next;
    } else {
      object[key] = null;
      index += 1;
    }
  }
  return { value: object, next: index };
}

function parseSequence(tokens, start, indent, sourceLines) {
  const array = [];
  let index = start;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.indent < indent) break;
    if (token.indent !== indent || !/^-(?:\s|$)/.test(token.content)) break;
    const rest = stripInlineComment(token.content.slice(1)).trim();
    if (rest === '') {
      if (index + 1 < tokens.length && tokens[index + 1].indent > indent) {
        const parsed = parseBlock(tokens, index + 1, tokens[index + 1].indent, sourceLines);
        array.push(parsed.value);
        index = parsed.next;
      } else {
        array.push(null);
        index += 1;
      }
      continue;
    }
    const colon = findMappingColon(rest);
    if (colon >= 0) {
      const object = {};
      const key = parseKey(rest.slice(0, colon));
      const valueText = stripInlineComment(rest.slice(colon + 1)).trim();
      if (valueText === '|' || valueText === '|-' || valueText === '|+' || valueText === '>' || valueText === '>-' || valueText === '>+') {
        const parsed = parseBlockScalar(tokens, index, indent, valueText, sourceLines);
        object[key] = parsed.value;
        index = parsed.next;
      } else if (valueText !== '') {
        object[key] = parseScalar(valueText);
        index += 1;
      } else if (index + 1 < tokens.length && tokens[index + 1].indent > indent + 1) {
        const parsed = parseBlock(tokens, index + 1, tokens[index + 1].indent, sourceLines);
        object[key] = parsed.value;
        index = parsed.next;
      } else {
        object[key] = null;
        index += 1;
      }
      if (index < tokens.length && tokens[index].indent > indent) {
        const childIndent = tokens[index].indent;
        const parsed = parseMapping(tokens, index, childIndent, sourceLines, object);
        index = parsed.next;
      }
      array.push(object);
      continue;
    }
    array.push(parseScalar(rest));
    index += 1;
  }
  return { value: array, next: index };
}

export function parseYaml(text) {
  const sourceLines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const tokens = tokenize(text);
  if (tokens.length === 0) return {};
  const parsed = parseBlock(tokens, 0, tokens[0].indent, sourceLines);
  if (parsed.next !== tokens.length) {
    const token = tokens[parsed.next];
    throw new Error(`Could not parse YAML near line ${token.line}.`);
  }
  return parsed.value;
}

function scalarToYaml(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  const string = String(value);
  if (string.includes('\n')) return null;
  if (string === '') return '""';
  if (/^(?:null|~|true|false|[-+]?\d+(?:\.\d+)?|\[\]|\{\})$/i.test(string)) return JSON.stringify(string);
  if (/^[A-Za-z0-9_./@+-]+$/.test(string) && !string.startsWith('-')) return string;
  return JSON.stringify(string);
}

function emit(value, indent, lines) {
  const prefix = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push(`${prefix}[]`);
      return;
    }
    for (const item of value) {
      if (item !== null && typeof item === 'object') {
        if (Array.isArray(item)) {
          lines.push(`${prefix}-`);
          emit(item, indent + 2, lines);
        } else {
          const entries = Object.entries(item);
          if (entries.length === 0) {
            lines.push(`${prefix}- {}`);
            continue;
          }
          const [firstKey, firstValue] = entries[0];
          const scalar = scalarToYaml(firstValue);
          if (scalar !== null && (firstValue === null || typeof firstValue !== 'object')) {
            lines.push(`${prefix}- ${firstKey}: ${scalar}`);
          } else if (typeof firstValue === 'string' && firstValue.includes('\n')) {
            lines.push(`${prefix}- ${firstKey}: |-`);
            for (const line of firstValue.split('\n')) lines.push(`${prefix}    ${line}`);
          } else {
            lines.push(`${prefix}- ${firstKey}:`);
            emit(firstValue, indent + 4, lines);
          }
          for (const [key, child] of entries.slice(1)) emitMappingEntry(key, child, indent + 2, lines);
        }
      } else {
        lines.push(`${prefix}- ${scalarToYaml(item)}`);
      }
    }
    return;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      lines.push(`${prefix}{}`);
      return;
    }
    for (const [key, child] of entries) emitMappingEntry(key, child, indent, lines);
    return;
  }
  lines.push(`${prefix}${scalarToYaml(value)}`);
}

function emitMappingEntry(key, value, indent, lines) {
  const prefix = ' '.repeat(indent);
  const safeKey = /^[A-Za-z0-9_.-]+$/.test(key) ? key : JSON.stringify(key);
  if (typeof value === 'string' && value.includes('\n')) {
    lines.push(`${prefix}${safeKey}: |-`);
    for (const line of value.split('\n')) lines.push(`${prefix}  ${line}`);
    return;
  }
  if (value !== null && typeof value === 'object') {
    if (Array.isArray(value) && value.length === 0) {
      lines.push(`${prefix}${safeKey}: []`);
      return;
    }
    if (!Array.isArray(value) && Object.keys(value).length === 0) {
      lines.push(`${prefix}${safeKey}: {}`);
      return;
    }
    lines.push(`${prefix}${safeKey}:`);
    emit(value, indent + 2, lines);
    return;
  }
  lines.push(`${prefix}${safeKey}: ${scalarToYaml(value)}`);
}

export function stringifyYaml(value) {
  const lines = [];
  emit(value, 0, lines);
  return `${lines.join('\n')}\n`;
}

export function readYaml(filePath) {
  return parseYaml(readText(filePath));
}

export function writeYamlAtomic(filePath, value) {
  writeTextAtomic(filePath, stringifyYaml(value));
}
