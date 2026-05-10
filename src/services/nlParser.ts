import * as chrono from 'chrono-node';

export type EnergyTag = 'deep' | 'quick' | 'low';

export type ParsedTask = {
  title: string;
  dueAt: Date | null;
  energyTag: EnergyTag;
  estimatedMin: number | null;
};

const DEEP_WORDS = /\b(deep|focus|report|review|write|proposal|strategy|analysis)\b/i;
const QUICK_WORDS = /\b(quick|short|call|buy|email|msg|text|ping)\b/i;
const LOW_WORDS = /\b(low energy|mindless|chore| tidy|clean|sort)\b/i;

function stripDateFromTitle(input: string, ref: Date): {title: string; due: Date | null} {
  const results = chrono.casual.parse(input, ref, {forwardDate: true});
  if (results.length === 0) {
    return {title: input.trim(), due: null};
  }

  let title = input;
  for (const r of results.sort((a, b) => b.index - a.index)) {
    title = title.slice(0, r.index) + title.slice(r.index + r.text.length);
  }
  title = title.replace(/\s+/g, ' ').replace(/^\s*,\s*/, '').trim();

  const due = results[0]?.start.date() ?? null;
  return {title: title || input.trim(), due};
}

function detectEnergy(text: string): EnergyTag {
  if (DEEP_WORDS.test(text)) {
    return 'deep';
  }
  if (LOW_WORDS.test(text)) {
    return 'low';
  }
  if (QUICK_WORDS.test(text)) {
    return 'quick';
  }
  return 'quick';
}

function detectEstimateMinutes(text: string): number | null {
  const m = text.match(/\b(\d+)\s*(min|minutes|mins)\b/i);
  if (m) {
    return parseInt(m[1], 10);
  }
  return null;
}

/**
 * Offline NL task parser — Section 3.3 / Prompt 05.
 */
export function parseTaskInput(input: string, refDate = new Date()): ParsedTask {
  const trimmed = input.trim();
  const energyTag = detectEnergy(trimmed);
  const estimatedMin = detectEstimateMinutes(trimmed);
  const {title, due} = stripDateFromTitle(trimmed, refDate);
  const cleaned = title.replace(/\s+/g, ' ').trim();

  return {
    title: cleaned || trimmed,
    dueAt: due,
    energyTag,
    estimatedMin,
  };
}
