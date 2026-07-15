import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8');

function themeTokens(selector) {
  const block = cssRule(selector);
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
}

function rgb(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function composite(foreground, background, alpha) {
  const fg = rgb(foreground);
  const bg = rgb(background);
  return fg.map((value, index) => Math.round(value * alpha + bg[index] * (1 - alpha)));
}

function luminance(color) {
  const channels = Array.isArray(color) ? color : rgb(color);
  const linear = channels.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function cssRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = landing.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test('status cards remain shrinkable and wrap long content on a 390px viewport', () => {
  assert.match(cssRule('.honesty-card'), /min-width:\s*0/);
  assert.match(cssRule('.honesty-card h3'), /flex-wrap:\s*wrap/);
  assert.match(cssRule('.honesty-card code'), /overflow-wrap:\s*anywhere/);
});

test('landing headings do not skip levels', () => {
  const headings = [...landing.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((match) => ({
    level: Number(match[1]),
    text: match[2].replace(/<[^>]+>/g, '').trim(),
  }));
  for (let index = 1; index < headings.length; index += 1) {
    assert.ok(
      headings[index].level <= headings[index - 1].level + 1,
      `${headings[index].text} skips from H${headings[index - 1].level} to H${headings[index].level}`,
    );
  }
});

test('landing declares a valid inline favicon without a network request', () => {
  const favicon = landing.match(/<link\s+rel="icon"\s+href="([^"]+)"\s*\/?>/);
  assert.ok(favicon, 'Missing explicit favicon');
  assert.match(favicon[1], /^data:image\/svg\+xml,/);
  assert.match(favicon[1], /%3Csvg.*%3C\/svg%3E$/);
});

test('the ten recorded dark and light palette failures meet their WCAG thresholds', () => {
  const dark = themeTokens(':root');
  const light = { ...dark, ...themeTokens('[data-theme="light"]') };
  const pairs = [
    ['dark two-axis example', dark['axis-text'] ?? dark['text-dim'], composite(dark.accent, dark['bg-card'], 0.10), 7],
    ['dark hero and footer metadata', dark['text-mute'], dark.bg, 4.5],
    ['dark card tags routes and badges', dark['text-mute'], dark['bg-card'], 4.5],
    ['dark muted pill', dark['text-mute'], dark['bg-elev'], 4.5],
    ['light hero and footer metadata', light['text-mute'], light.bg, 4.5],
    ['light card tags routes and badges', light['text-mute'], light['bg-card'], 4.5],
    ['light accent on two-axis panel', light.accent, composite(light.accent, light['bg-card'], 0.08), 4.5],
    ['light readiness pill', light.ok, light['ok-soft'] ?? composite('#4ade80', light['bg-card'], 0.12), 4.5],
    ['light performance pill', light.warn, light['warn-soft'] ?? composite('#ff8a3d', light['bg-card'], 0.12), 4.5],
    ['light primary button', light['button-text'] ?? '#0a0b0d', light.accent, 4.5],
  ];
  for (const [name, foreground, background, threshold] of pairs) {
    assert.ok(contrast(foreground, background) >= threshold, `${name} has insufficient contrast`);
  }
});
