import { describe, expect, it } from 'vitest';
import { docsBySlug } from '../../docs/src/registry';
import { examplesFor } from '../../docs/src/examples';
import { componentApi } from '../../docs/src/components/ApiTables';

const patterns = ['list-report', 'bulk-action-bar', 'object-editor', 'approval-workflow', 'activity-feed', 'audit-trail'];
describe('Phase 3 documentation', () => {
  for (const slug of patterns) {
    it(`${slug} has a registered page, API declaration and example`, () => {
      const page = docsBySlug.get(slug);
      expect(page).toBeDefined();
      expect(examplesFor(page!.examples ?? slug).length).toBeGreaterThan(0);
      expect(componentApi[page!.components[0]]).toBeDefined();
    });
  }
});
