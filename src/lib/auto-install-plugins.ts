// ─── Auto-install plugin mappings per device type ──────────────────────────
// When a user creates a board with a specific device type, these plugins
// are automatically marked as installed to streamline their workflow.

import type { DeviceTypeGroup } from '@/lib/device-templates';

const COMMON_PLUGINS = [
  'shapes-basic',
  'shapes-arrows',
  'icons-lucide',
  'images-placeholder',
  'export-png',
  'export-svg',
  'colors-palette-generator',
  'typography-web-fonts',
];

const MOBILE_PLUGINS = [
  'wireframe-inputs',
  'wireframe-buttons',
  'wireframe-cards',
  'wireframe-navbars',
  'wireframe-forms',
  'wireframe-modals',
  'responsive-device-preview',
  'responsive-breakpoints',
  'a11y-touch-targets',
  'prototyping-device-frame',
  'colors-contrast',
  'text-typography-scale',
  'layout-auto-flow',
  'ai-wireframe-gen',
];

const IPHONE_SPECIFIC = [
  ...COMMON_PLUGINS,
  ...MOBILE_PLUGINS,
  'wireframe-tables',
  'prototyping-scroll-sim',
  'prototyping-interactive-states',
  'a11y-screen-reader',
  'typography-font-pair',
];

const ANDROID_SPECIFIC = [
  ...COMMON_PLUGINS,
  ...MOBILE_PLUGINS,
  'icons-material',
  'wireframe-tables',
  'prototyping-scroll-sim',
  'prototyping-interactive-states',
  'a11y-screen-reader',
  'layout-spacing',
];

const WEBSITE_PLUGINS = [
  ...COMMON_PLUGINS,
  'layout-grid',
  'layout-flexbox',
  'layout-responsive',
  'layout-css-grid',
  'wireframe-inputs',
  'wireframe-buttons',
  'wireframe-cards',
  'wireframe-navbars',
  'wireframe-footers',
  'wireframe-modals',
  'responsive-device-preview',
  'responsive-breakpoints',
  'responsive-fluid-typography',
  'code-gen-react',
  'code-gen-tailwind',
  'export-css',
  'ai-auto-layout',
  'a11y-focus-order',
  'a11y-semantic-structure',
  'images-screenshot-frame',
  'text-rich-text',
];

const TABLET_PLUGINS = [
  ...COMMON_PLUGINS,
  ...MOBILE_PLUGINS,
  'wireframe-tables',
  'wireframe-sidebar-kit',
  'layout-grid',
  'layout-flexbox',
  'responsive-breakpoints',
  'prototyping-device-frame',
  'prototyping-interactive-states',
  'a11y-touch-targets',
];

const PRESENTATION_PLUGINS = [
  'shapes-basic',
  'shapes-arrows',
  'shapes-stars',
  'layout-grid',
  'typography-web-fonts',
  'typography-font-pair',
  'typography-line-height',
  'colors-palette-generator',
  'colors-gradient',
  'branding-logo-maker',
  'export-pdf',
  'export-png',
  'images-placeholder',
  'icons-lucide',
  'text-typography-scale',
  'text-headings',
  'animation-fade-in',
  'animation-slide-in',
  'illustration-patterns',
];

const SOCIAL_PLUGINS = [
  'shapes-basic',
  'branding-social-media',
  'branding-logo-maker',
  'images-photo-grid',
  'colors-palette-generator',
  'images-placeholder',
  'images-avatar-group',
  'export-png',
  'photo-editing-filters',
  'photo-editing-crop',
  'photo-editing-adjustments',
  'icons-lucide',
  'typography-web-fonts',
  'colors-brand',
  'branding-brand-kit',
  'images-unsplash-integration',
];

export const DEVICE_AUTO_INSTALL_PLUGINS: Record<string, string[]> = {
  iphone: IPHONE_SPECIFIC,
  android: ANDROID_SPECIFIC,
  website: WEBSITE_PLUGINS,
  tablet: TABLET_PLUGINS,
  presentation: PRESENTATION_PLUGINS,
  social: SOCIAL_PLUGINS,
};

export function getAutoInstallPlugins(deviceType?: string | null): string[] {
  if (!deviceType) return [];
  return DEVICE_AUTO_INSTALL_PLUGINS[deviceType] ?? [];
}