import { defineConfig } from '@playwright/test';
import phaseConfig from './playwright.phase3.config';
/** Run the existing documentation axe audit across the supported desktop browser projects. */
export default defineConfig({ ...phaseConfig, testMatch: 'a11y.spec.ts', projects: phaseConfig.projects?.filter((project) => project.name !== 'mobile-chromium') });
