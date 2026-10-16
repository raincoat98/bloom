import { describe, expect, it } from 'vitest';
import {
  phaseGuides,
  periodSupplies,
  suppliesPhases,
  suppliesTip,
  type Phase,
} from './phaseGuides';

const ALL_PHASES: Phase[] = ['생리 중', '여포기', '배란기', '황체기'];

describe('phaseGuides data', () => {
  it('covers all cycle phases with complete guide content', () => {
    ALL_PHASES.forEach((phase) => {
      const guide = phaseGuides[phase];
      expect(guide).toBeDefined();
      expect(guide.title.trim().length).toBeGreaterThan(0);
      expect(guide.emoji.trim().length).toBeGreaterThan(0);
      expect(guide.summary.length).toBeGreaterThan(0);
      guide.summary.forEach((line) => {
        expect(line.trim().length).toBeGreaterThan(0);
      });
      expect(guide.foods.length).toBeGreaterThan(0);
      guide.foods.forEach((food) => {
        expect(food.trim().length).toBeGreaterThan(0);
      });
      expect(guide.supplements.length).toBeGreaterThan(0);
      guide.supplements.forEach((s) => {
        expect(s.name.trim().length).toBeGreaterThan(0);
        expect(s.desc.trim().length).toBeGreaterThan(0);
      });
      expect(guide.partnerTip.trim().length).toBeGreaterThan(0);
    });
  });

  it('provides concise food badges without verbose sentence structures', () => {
    ALL_PHASES.forEach((phase) => {
      const guide = phaseGuides[phase];
      guide.foods.forEach((food) => {
        // Badges should not be long sentences containing "풍부한 음식 ("
        expect(food).not.toContain('풍부한 음식');
      });
    });
  });

  it('provides concise supplement descriptions without repetitive boilerplate', () => {
    ALL_PHASES.forEach((phase) => {
      const guide = phaseGuides[phase];
      guide.supplements.forEach((s) => {
        // Descriptions should be concise and not end with verbose "~에 도움을 줍니다."
        expect(s.desc).not.toContain('도움을 줍니다');
      });
    });
  });

  it('defines supplies and tip for period and PMS phases', () => {
    expect(suppliesPhases['생리 중']).toBe(true);
    expect(suppliesPhases['황체기']).toBe(true);
    expect(periodSupplies.length).toBeGreaterThan(0);
    periodSupplies.forEach((item) => {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.emoji.trim().length).toBeGreaterThan(0);
    });
    expect(suppliesTip.trim().length).toBeGreaterThan(0);
  });
});
