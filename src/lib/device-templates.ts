import type { DeviceTemplate } from '@/lib/types';

export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // iPhone Models
  // ═══════════════════════════════════════════════════════════════════════════════
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', category: 'phone', width: 440, height: 956, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', category: 'phone', width: 402, height: 874, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-16', name: 'iPhone 16', category: 'phone', width: 393, height: 852, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-16-plus', name: 'iPhone 16 Plus', category: 'phone', width: 430, height: 932, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', category: 'phone', width: 430, height: 932, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'phone', width: 393, height: 852, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-15', name: 'iPhone 15', category: 'phone', width: 393, height: 852, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-15-plus', name: 'iPhone 15 Plus', category: 'phone', width: 430, height: 932, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', category: 'phone', width: 430, height: 932, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', category: 'phone', width: 393, height: 852, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-14', name: 'iPhone 14', category: 'phone', width: 390, height: 844, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-14-plus', name: 'iPhone 14 Plus', category: 'phone', width: 428, height: 926, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', category: 'phone', width: 428, height: 926, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-13-pro', name: 'iPhone 13 Pro', category: 'phone', width: 390, height: 844, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-13', name: 'iPhone 13', category: 'phone', width: 390, height: 844, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-13-mini', name: 'iPhone 13 Mini', category: 'phone', width: 375, height: 812, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-12-pro-max', name: 'iPhone 12 Pro Max', category: 'phone', width: 428, height: 926, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-12-pro', name: 'iPhone 12 Pro', category: 'phone', width: 390, height: 844, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-12', name: 'iPhone 12', category: 'phone', width: 390, height: 844, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-12-mini', name: 'iPhone 12 Mini', category: 'phone', width: 375, height: 812, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-11-pro-max', name: 'iPhone 11 Pro Max', category: 'phone', width: 414, height: 896, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-11-pro', name: 'iPhone 11 Pro', category: 'phone', width: 375, height: 812, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-11', name: 'iPhone 11', category: 'phone', width: 414, height: 896, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-xs-max', name: 'iPhone Xs Max', category: 'phone', width: 414, height: 896, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-xs', name: 'iPhone Xs', category: 'phone', width: 375, height: 812, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-xr', name: 'iPhone Xr', category: 'phone', width: 414, height: 896, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-x', name: 'iPhone X', category: 'phone', width: 375, height: 812, statusBarHeight: 54, homeIndicatorHeight: 34 },
  { id: 'iphone-8-plus', name: 'iPhone 8 Plus', category: 'phone', width: 414, height: 736, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'iphone-8', name: 'iPhone 8', category: 'phone', width: 375, height: 667, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'iphone-7-plus', name: 'iPhone 7 Plus', category: 'phone', width: 414, height: 736, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'iphone-7', name: 'iPhone 7', category: 'phone', width: 375, height: 667, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'iphone-se-3rd', name: 'iPhone SE 3rd Gen', category: 'phone', width: 375, height: 667, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'iphone-se-2nd', name: 'iPhone SE 2nd Gen', category: 'phone', width: 375, height: 667, statusBarHeight: 44, homeIndicatorHeight: 0 },
  { id: 'iphone-se-1st', name: 'iPhone SE 1st Gen', category: 'phone', width: 320, height: 568, statusBarHeight: 44, homeIndicatorHeight: 0 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // Android Phones
  // ═══════════════════════════════════════════════════════════════════════════════
  // Samsung
  { id: 'galaxy-s24-ultra', name: 'Samsung Galaxy S24 Ultra', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s24-plus', name: 'Samsung Galaxy S24+', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s24', name: 'Samsung Galaxy S24', category: 'phone', width: 360, height: 780, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s23-ultra', name: 'Samsung Galaxy S23 Ultra', category: 'phone', width: 384, height: 854, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s23', name: 'Samsung Galaxy S23', category: 'phone', width: 360, height: 780, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s22-ultra', name: 'Samsung Galaxy S22 Ultra', category: 'phone', width: 384, height: 854, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s22', name: 'Samsung Galaxy S22', category: 'phone', width: 360, height: 780, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s21-ultra', name: 'Samsung Galaxy S21 Ultra', category: 'phone', width: 384, height: 854, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-s21', name: 'Samsung Galaxy S21', category: 'phone', width: 360, height: 800, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-z-fold-5', name: 'Samsung Galaxy Z Fold 5', category: 'phone', width: 682, height: 882, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-z-flip-5', name: 'Samsung Galaxy Z Flip 5', category: 'phone', width: 360, height: 780, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // Google Pixel
  { id: 'pixel-9-pro-xl', name: 'Google Pixel 9 Pro XL', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-9-pro', name: 'Google Pixel 9 Pro', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-9', name: 'Google Pixel 9', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-8-pro', name: 'Google Pixel 8 Pro', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-8', name: 'Google Pixel 8', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-8a', name: 'Google Pixel 8a', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-7-pro', name: 'Google Pixel 7 Pro', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-7', name: 'Google Pixel 7', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-7a', name: 'Google Pixel 7a', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-6-pro', name: 'Google Pixel 6 Pro', category: 'phone', width: 412, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-6', name: 'Google Pixel 6', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // OnePlus
  { id: 'oneplus-12', name: 'OnePlus 12', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'oneplus-11', name: 'OnePlus 11', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'oneplus-nord-4', name: 'OnePlus Nord 4', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // Xiaomi
  { id: 'xiaomi-14-pro', name: 'Xiaomi 14 Pro', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'xiaomi-14', name: 'Xiaomi 14', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'xiaomi-13-pro', name: 'Xiaomi 13 Pro', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // Nothing
  { id: 'nothing-phone-2', name: 'Nothing Phone 2', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'nothing-phone-2a', name: 'Nothing Phone 2a', category: 'phone', width: 393, height: 873, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // Motorola
  { id: 'motorola-edge-40-pro', name: 'Motorola Edge 40 Pro', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'motorola-razr-50-ultra', name: 'Motorola Razr 50 Ultra', category: 'phone', width: 393, height: 852, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // Sony / Oppo / Huawei
  { id: 'sony-xperia-1-vi', name: 'Sony Xperia 1 VI', category: 'phone', width: 411, height: 892, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'oppo-find-x7-ultra', name: 'Oppo Find X7 Ultra', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'huawei-p60-pro', name: 'Huawei P60 Pro', category: 'phone', width: 412, height: 915, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // Android Tablets
  // ═══════════════════════════════════════════════════════════════════════════════
  { id: 'galaxy-tab-s9-ultra', name: 'Samsung Galaxy Tab S9 Ultra', category: 'tablet', width: 753, height: 1205, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-tab-s9-plus', name: 'Samsung Galaxy Tab S9+', category: 'tablet', width: 732, height: 1116, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-tab-s9', name: 'Samsung Galaxy Tab S9', category: 'tablet', width: 684, height: 1116, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-tab-s8', name: 'Samsung Galaxy Tab S8', category: 'tablet', width: 753, height: 1205, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'galaxy-tab-a9', name: 'Samsung Galaxy Tab A9', category: 'tablet', width: 560, height: 1080, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'pixel-tablet', name: 'Google Pixel Tablet', category: 'tablet', width: 768, height: 1104, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'xiaomi-pad-6', name: 'Xiaomi Pad 6', category: 'tablet', width: 768, height: 1152, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'oneplus-pad', name: 'OnePlus Pad', category: 'tablet', width: 880, height: 1374, statusBarHeight: 48, homeIndicatorHeight: 0 },
  { id: 'huawei-matepad-pro', name: 'Huawei MatePad Pro', category: 'tablet', width: 753, height: 1205, statusBarHeight: 48, homeIndicatorHeight: 0 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // iPad Models
  // ═══════════════════════════════════════════════════════════════════════════════
  { id: 'ipad-pro-129-m4', name: 'iPad Pro 12.9" M4', category: 'tablet', width: 1024, height: 1366, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-pro-129-m2', name: 'iPad Pro 12.9" M2', category: 'tablet', width: 1024, height: 1366, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-pro-11-m4', name: 'iPad Pro 11" M4', category: 'tablet', width: 834, height: 1194, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-pro-11-m2', name: 'iPad Pro 11" M2', category: 'tablet', width: 834, height: 1194, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-air-m2', name: 'iPad Air M2', category: 'tablet', width: 820, height: 1180, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-air-5th', name: 'iPad Air 5th Gen', category: 'tablet', width: 820, height: 1180, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-mini-6th', name: 'iPad Mini 6th Gen', category: 'tablet', width: 744, height: 1133, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-10th', name: 'iPad 10th Gen', category: 'tablet', width: 810, height: 1080, statusBarHeight: 24, homeIndicatorHeight: 0 },
  { id: 'ipad-9th', name: 'iPad 9th Gen', category: 'tablet', width: 810, height: 1080, statusBarHeight: 24, homeIndicatorHeight: 0 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // Website / Desktop
  // ═══════════════════════════════════════════════════════════════════════════════
  // Standard Desktop
  { id: 'desktop-1920', name: 'Desktop Full HD (1920×1080)', category: 'desktop', width: 1920, height: 1080 },
  { id: 'desktop-qhd', name: 'Desktop QHD (2560×1440)', category: 'desktop', width: 2560, height: 1440 },
  { id: 'desktop-4k', name: 'Desktop 4K (3840×2160)', category: 'desktop', width: 3840, height: 2160 },
  { id: 'desktop-1680', name: 'Desktop (1680×1050)', category: 'desktop', width: 1680, height: 1050 },
  { id: 'desktop-1366', name: 'Common Laptop (1366×768)', category: 'desktop', width: 1366, height: 768 },
  { id: 'desktop-1440', name: 'MacBook Air 13" (1440×900)', category: 'desktop', width: 1440, height: 900 },
  { id: 'macbook-pro-14', name: 'MacBook Pro 14" (1512×982)', category: 'desktop', width: 1512, height: 982 },
  { id: 'macbook-pro-16', name: 'MacBook Pro 16" (1728×1117)', category: 'desktop', width: 1728, height: 1117 },
  { id: 'surface-pro', name: 'Surface Pro (1920×1280)', category: 'desktop', width: 1920, height: 1280 },
  { id: 'chromebook', name: 'Chromebook (1366×768)', category: 'desktop', width: 1366, height: 768 },

  // Responsive Breakpoints
  { id: 'responsive-xs', name: 'Mobile S (320×568)', category: 'desktop', width: 320, height: 568 },
  { id: 'responsive-sm', name: 'Mobile M (375×667)', category: 'desktop', width: 375, height: 667 },
  { id: 'responsive-md', name: 'Mobile L (390×844)', category: 'desktop', width: 390, height: 844 },
  { id: 'responsive-lg', name: 'Phablet (428×926)', category: 'desktop', width: 428, height: 926 },
  { id: 'responsive-xl', name: 'Tablet (768×1024)', category: 'desktop', width: 768, height: 1024 },
  { id: 'responsive-2xl', name: 'Landscape Tablet (1024×768)', category: 'desktop', width: 1024, height: 768 },
  { id: 'responsive-hd', name: 'HD (1280×720)', category: 'desktop', width: 1280, height: 720 },
  { id: 'responsive-wxga', name: 'WXGA (1440×900)', category: 'desktop', width: 1440, height: 900 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // Presentations
  // ═══════════════════════════════════════════════════════════════════════════════
  { id: 'presentation-169', name: 'Presentation 16:9 (1920×1080)', category: 'presentation', width: 1920, height: 1080 },
  { id: 'presentation-43', name: 'Presentation 4:3 (1440×1080)', category: 'presentation', width: 1440, height: 1080 },
  { id: 'presentation-11', name: 'Presentation 1:1 (1080×1080)', category: 'presentation', width: 1080, height: 1080 },

  // ═══════════════════════════════════════════════════════════════════════════════
  // Social Media
  // ═══════════════════════════════════════════════════════════════════════════════
  // Instagram
  { id: 'instagram-post', name: 'Instagram Post (1080×1080)', category: 'social', width: 1080, height: 1080 },
  { id: 'instagram-story', name: 'Instagram Story (1080×1920)', category: 'social', width: 1080, height: 1920 },
  { id: 'instagram-reel', name: 'Instagram Reel (1080×1920)', category: 'social', width: 1080, height: 1920 },

  // YouTube
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail (1280×720)', category: 'social', width: 1280, height: 720 },

  // Facebook
  { id: 'facebook-cover', name: 'Facebook Cover (820×312)', category: 'social', width: 820, height: 312 },

  // Twitter / X
  { id: 'twitter-header', name: 'Twitter Header (1500×500)', category: 'social', width: 1500, height: 500 },

  // LinkedIn
  { id: 'linkedin-banner', name: 'LinkedIn Banner (1584×396)', category: 'social', width: 1584, height: 396 },

  // TikTok
  { id: 'tiktok', name: 'TikTok Video (1080×1920)', category: 'social', width: 1080, height: 1920 },

  // Pinterest
  { id: 'pinterest', name: 'Pinterest Pin (1000×1500)', category: 'social', width: 1000, height: 1500 },
];

// ═════════════════════════════════════════════════════════════════════════════════
// Device Type Groups (for UI categorization in the create board dialog)
// ═════════════════════════════════════════════════════════════════════════════════

export type DeviceTypeGroup = 'iphone' | 'android' | 'website' | 'tablet' | 'presentation' | 'social';

export interface DeviceTypeCategory {
  id: DeviceTypeGroup;
  labelKey: string; // i18n key
  icon: string; // emoji for display
  filterCategories: DeviceTemplate['category'][];
  filterPrefix?: string; // ID prefix to further filter within category
}

export const DEVICE_TYPE_GROUPS: DeviceTypeCategory[] = [
  {
    id: 'iphone',
    labelKey: 'board.deviceTypeIphone',
    icon: '📱',
    filterCategories: ['phone'],
    filterPrefix: 'iphone',
  },
  {
    id: 'android',
    labelKey: 'board.deviceTypeAndroid',
    icon: '🤖',
    filterCategories: ['phone'],
    filterPrefix: undefined, // phones that are NOT iphone
  },
  {
    id: 'website',
    labelKey: 'board.deviceTypeWebsite',
    icon: '🌐',
    filterCategories: ['desktop'],
  },
  {
    id: 'tablet',
    labelKey: 'board.deviceTypeTablet',
    icon: '📱',
    filterCategories: ['tablet'],
  },
  {
    id: 'presentation',
    labelKey: 'board.deviceTypePresentation',
    icon: '📊',
    filterCategories: ['presentation'],
  },
  {
    id: 'social',
    labelKey: 'board.deviceTypeSocial',
    icon: '📸',
    filterCategories: ['social'],
  },
];

export function getDevicesByCategory(category: DeviceTemplate['category']): DeviceTemplate[] {
  return DEVICE_TEMPLATES.filter((d) => d.category === category);
}

export function getDevicesByTypeGroup(group: DeviceTypeGroup): DeviceTemplate[] {
  const groupDef = DEVICE_TYPE_GROUPS.find((g) => g.id === group);
  if (!groupDef) return [];

  return DEVICE_TEMPLATES.filter((d) => {
    if (!groupDef.filterCategories.includes(d.category)) return false;

    if (groupDef.id === 'android') {
      // Android = phone category but NOT starting with 'iphone'
      return !d.id.startsWith('iphone');
    }

    if (groupDef.filterPrefix) {
      return d.id.startsWith(groupDef.filterPrefix);
    }

    return true;
  });
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
