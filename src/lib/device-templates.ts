import type { DeviceTemplate } from '@/lib/types';

export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // Phones
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'phone', width: 393, height: 852, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-15', name: 'iPhone 15', category: 'phone', width: 393, height: 852, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-14', name: 'iPhone 14', category: 'phone', width: 390, height: 844, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-se', name: 'iPhone SE', category: 'phone', width: 375, height: 667, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'pixel-8', name: 'Pixel 8', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s24', name: 'Galaxy S24', category: 'phone', width: 360, height: 780, statusBarHeight: 48, homeIndicatorHeight: 0 },
  // Tablets
  { id: 'ipad-pro-129', name: 'iPad Pro 12.9"', category: 'tablet', width: 1024, height: 1366, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', category: 'tablet', width: 834, height: 1194, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-mini', name: 'iPad Mini', category: 'tablet', width: 744, height: 1133, statusBarHeight: 24, homeIndicatorHeight: 0 },
  // Desktop
  { id: 'desktop-1920', name: 'Desktop 1920×1080', category: 'desktop', width: 1920, height: 1080 },
  { id: 'desktop-1440', name: 'Desktop 1440×900', category: 'desktop', width: 1440, height: 900 },
  { id: 'desktop-1366', name: 'Desktop 1366×768', category: 'desktop', width: 1366, height: 768 },
  { id: 'macbook-air', name: 'MacBook Air', category: 'desktop', width: 1440, height: 900 },
  // Presentation
  { id: 'presentation-169', name: 'Presentation 16:9', category: 'presentation', width: 1920, height: 1080 },
  { id: 'presentation-43', name: 'Presentation 4:3', category: 'presentation', width: 1440, height: 1080 },
];

export function getDevicesByCategory(category: DeviceTemplate['category']): DeviceTemplate[] {
  return DEVICE_TEMPLATES.filter((d) => d.category === category);
}

export function createFrameFromDevice(template: DeviceTemplate, x: number, y: number) {
  return {
    type: 'FRAME' as const,
    x,
    y,
    width: template.width,
    height: template.height,
    content: template.name,
    styles: {
      fills: [{ id: `fill-${Date.now()}`, type: 'solid' as const, color: '#FFFFFF', opacity: 1 }],
      frameDevice: template.id,
      frameClip: true,
    },
  };
}
