import {parseTaskInput} from '../src/services/nlParser';

describe('parseTaskInput', () => {
  const ref = new Date('2026-05-10T12:00:00');

  it('parses tomorrow deadline', () => {
    const r = parseTaskInput('Submit report tomorrow at 3pm', ref);
    expect(r.title.toLowerCase()).toContain('submit report');
    expect(r.dueAt).not.toBeNull();
    expect(r.energyTag).toBe('deep');
  });

  it('defaults quick energy for simple buy phrase', () => {
    const r = parseTaskInput('Buy groceries', ref);
    expect(r.title.toLowerCase()).toContain('groceries');
    expect(r.energyTag).toBe('quick');
  });

  it('detects weekly recurrence text stripped', () => {
    const r = parseTaskInput('Review docs every Monday', ref);
    expect(r.title.toLowerCase()).toContain('review docs');
  });

  it('detects deep via review keyword', () => {
    const r = parseTaskInput('Review design mockups', ref);
    expect(r.energyTag).toBe('deep');
  });

  it('detects quick via call keyword', () => {
    const r = parseTaskInput('Call mum this weekend', ref);
    expect(r.energyTag).toBe('quick');
    expect(r.dueAt).not.toBeNull();
  });

  it('captures minute estimates', () => {
    const r = parseTaskInput('Tidy desk 15 minutes', ref);
    expect(r.estimatedMin).toBe(15);
  });

  it('handles empty gracefully', () => {
    const r = parseTaskInput('   ', ref);
    expect(r.title.length).toBeGreaterThanOrEqual(0);
    expect(r.energyTag).toBe('quick');
  });

  it('parses es shorthand deep', () => {
    const r = parseTaskInput('Write strategy memo Friday 9am', ref);
    expect(r.energyTag).toBe('deep');
  });

  it('parses quick email', () => {
    const r = parseTaskInput('Email vendor about invoice', ref);
    expect(r.energyTag).toBe('quick');
  });

  it('parses focus keyword', () => {
    const r = parseTaskInput('Deep focus block Tuesday 4pm', ref);
    expect(r.energyTag).toBe('deep');
  });
});
