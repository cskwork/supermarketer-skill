import fs from 'node:fs';
import path from 'node:path';
import { addError } from './result.mjs';
import { readJson, readText, safeExistingPath } from '../utils.mjs';
import { readYaml } from '../yaml-lite.mjs';

function governedFile(result, vault, name, required) {
  const lexicalPath = path.join(vault, name);
  if (!fs.existsSync(lexicalPath)) {
    if (required) addError(result, 'FILE_MISSING', `Required file is missing: ${name}`, name);
    return null;
  }
  try {
    return safeExistingPath(vault, name);
  } catch (error) {
    const code = /Symbolic links/i.test(error.message) ? 'FILE_SYMLINK' : 'FILE_UNSAFE';
    addError(result, code, `${name} is not a safe governed file: ${error.message}`, name);
    return null;
  }
}

export function loadYamlForGate(result, vault, name, required = true) {
  const filePath = governedFile(result, vault, name, required);
  if (!filePath) return null;
  try {
    return readYaml(filePath);
  } catch (error) {
    addError(result, 'YAML_INVALID', `${name} is not valid supported YAML: ${error.message}`, name);
    return null;
  }
}

export function loadJsonForGate(result, vault, name, required = true) {
  const filePath = governedFile(result, vault, name, required);
  if (!filePath) return null;
  try {
    return readJson(filePath);
  } catch (error) {
    addError(result, 'JSON_INVALID', `${name} is not valid JSON: ${error.message}`, name);
    return null;
  }
}

export function loadTextForGate(result, vault, name, required = true) {
  const filePath = governedFile(result, vault, name, required);
  if (!filePath) return null;
  try {
    return readText(filePath);
  } catch (error) {
    addError(result, 'FILE_UNREADABLE', `Could not read ${name}: ${error.message}`, name);
    return null;
  }
}

export function safeFile(result, vault, relativePath, location, options = {}) {
  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    if (options.required !== false) addError(result, 'PATH_EMPTY', 'Required path is empty.', location);
    return null;
  }
  try {
    return safeExistingPath(vault, relativePath, { directory: options.directory === true });
  } catch (error) {
    const message = error.message;
    let code = 'PATH_INVALID';
    if (/escapes|Absolute paths/i.test(message)) code = 'PATH_UNSAFE';
    else if (/Symbolic links/i.test(message)) code = 'PATH_SYMLINK';
    else if (/does not exist/i.test(message)) code = 'PATH_MISSING';
    else if (/Expected a directory/i.test(message)) code = 'PATH_NOT_DIRECTORY';
    else if (/Expected a file/i.test(message)) code = 'PATH_NOT_FILE';
    addError(result, code, message, location);
    return null;
  }
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateUrl(result, value, location, options = {}) {
  try {
    const url = new URL(value);
    const allowed = options.allowedProtocols ?? ['https:', 'http:'];
    if (!allowed.includes(url.protocol)) {
      addError(result, 'URL_PROTOCOL', `Unsupported URL protocol: ${url.protocol}`, location);
      return null;
    }
    if (options.requireHttps && url.protocol !== 'https:') {
      addError(result, 'URL_HTTPS_REQUIRED', 'HTTPS is required for this URL.', location);
      return null;
    }
    return url;
  } catch {
    addError(result, 'URL_INVALID', `Invalid URL: ${value}`, location);
    return null;
  }
}

export function stringSet(values) {
  return new Set((Array.isArray(values) ? values : []).filter((value) => typeof value === 'string' && value));
}

export function lower(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
