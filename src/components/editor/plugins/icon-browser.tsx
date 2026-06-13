'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import * as Icons from 'lucide-react';

const NEU_CARD =
  'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,30,0.06)]';

const NEU_INSET =
  'shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(30,30,30,0.05)]';

interface IconEntry {
  name: string;
  component: React.ElementType;
}

const ICON_LIST: IconEntry[] = [
  { name: 'Home', component: Icons.Home },
  { name: 'Settings', component: Icons.Settings },
  { name: 'User', component: Icons.User },
  { name: 'Search', component: Icons.Search },
  { name: 'Mail', component: Icons.Mail },
  { name: 'Bell', component: Icons.Bell },
  { name: 'Heart', component: Icons.Heart },
  { name: 'Star', component: Icons.Star },
  { name: 'Bookmark', component: Icons.Bookmark },
  { name: 'Camera', component: Icons.Camera },
  { name: 'Image', component: Icons.Image },
  { name: 'FileText', component: Icons.FileText },
  { name: 'Folder', component: Icons.Folder },
  { name: 'Calendar', component: Icons.Calendar },
  { name: 'Clock', component: Icons.Clock },
  { name: 'MapPin', component: Icons.MapPin },
  { name: 'Phone', component: Icons.Phone },
  { name: 'MessageCircle', component: Icons.MessageCircle },
  { name: 'Send', component: Icons.Send },
  { name: 'Share2', component: Icons.Share2 },
  { name: 'Download', component: Icons.Download },
  { name: 'Upload', component: Icons.Upload },
  { name: 'Link', component: Icons.Link },
  { name: 'ExternalLink', component: Icons.ExternalLink },
  { name: 'Copy', component: Icons.Copy },
  { name: 'Trash2', component: Icons.Trash2 },
  { name: 'Edit', component: Icons.Edit },
  { name: 'Plus', component: Icons.Plus },
  { name: 'Minus', component: Icons.Minus },
  { name: 'Check', component: Icons.Check },
  { name: 'X', component: Icons.X },
  { name: 'ChevronLeft', component: Icons.ChevronLeft },
  { name: 'ChevronRight', component: Icons.ChevronRight },
  { name: 'ChevronDown', component: Icons.ChevronDown },
  { name: 'ChevronUp', component: Icons.ChevronUp },
  { name: 'Menu', component: Icons.Menu },
  { name: 'MoreHorizontal', component: Icons.MoreHorizontal },
  { name: 'Filter', component: Icons.Filter },
  { name: 'Grid', component: Icons.Grid },
  { name: 'List', component: Icons.List },
  { name: 'Layout', component: Icons.Layout },
  { name: 'Sidebar', component: Icons.Sidebar },
  { name: 'Layers', component: Icons.Layers },
  { name: 'Eye', component: Icons.Eye },
  { name: 'EyeOff', component: Icons.EyeOff },
  { name: 'Lock', component: Icons.Lock },
  { name: 'Unlock', component: Icons.Unlock },
  { name: 'Zap', component: Icons.Zap },
  { name: 'Globe', component: Icons.Globe },
  { name: 'Wifi', component: Icons.Wifi },
  { name: 'Bluetooth', component: Icons.Bluetooth },
  { name: 'Volume2', component: Icons.Volume2 },
  { name: 'Mic', component: Icons.Mic },
  { name: 'Play', component: Icons.Play },
  { name: 'Pause', component: Icons.Pause },
  { name: 'SkipForward', component: Icons.SkipForward },
  { name: 'SkipBack', component: Icons.SkipBack },
];

function getViewportCenter() {
  const { panX, panY, zoom } = useCanvasStore.getState();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const canvasW = vw / zoom;
  const canvasH = vh / zoom;
  return {
    x: (canvasW / 2 - panX / zoom),
    y: (canvasH / 2 - panY / zoom),
  };
}

export function IconBrowser() {
  const [search, setSearch] = useState('');

  const filtered = ICON_LIST.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInsertIcon = useCallback((icon: IconEntry) => {
    const { x, y } = getViewportCenter();
    // We insert the icon name as a text element since we can't render React components as canvas content.
    // The user gets a text element with the icon name that they can style.
    const IconComp = icon.component;
    // Render the icon to an inline SVG string
    const svgElement = typeof window !== 'undefined'
      ? (() => {
          const temp = document.createElement('div');
          const ReactIcon = IconComp as React.ElementType;
          // We use a simple approach: render the lucide icon as an SVG string
          // by creating a fake element and serializing it
          return '';
        })()
      : '';

    // Use a simpler approach: create a TEXT element with an SVG string as content
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIconPaths(icon.name)}</svg>`;

    const store = useCanvasStore.getState();
    store.addElement('TEXT', x - 16, y - 16, {
      content: svgString,
      width: 32,
      height: 32,
      name: `Icon: ${icon.name}`,
      styles: {
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 24,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#1F2937',
          textAlign: 'left',
          fontStyle: 'normal',
          textCase: 'none',
        },
      },
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative p-3 pb-2">
        <Search className="absolute left-6 top-[22px] h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`pl-9 ${NEU_INSET} border-neutral-200/40 dark:border-neutral-700/30`}
        />
      </div>

      {/* Icon Grid */}
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {filtered.map((icon) => {
            const IconComp = icon.component;
            return (
              <button
                key={icon.name}
                onClick={() => handleInsertIcon(icon)}
                className={`flex aspect-square w-full items-center justify-center rounded-lg border border-neutral-200/40 dark:border-neutral-700/30 transition-all hover:border-primary/40 hover:bg-primary/5 ${NEU_CARD}`}
                title={icon.name}
              >
                <IconComp className="h-5 w-5 text-foreground/80" />
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No icons found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/**
 * Returns inner SVG path data for a given lucide icon name.
 * These are approximate path sets for the most common icons.
 */
function getIconPaths(name: string): string {
  const paths: Record<string, string> = {
    Home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>',
    User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    Search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',
    Mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
    Bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
    Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
    Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
    Bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>',
    Camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>',
    Image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
    FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
    Folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>',
    Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line>',
    Clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    MapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
    Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    MessageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>',
    Send: '<path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path>',
    Share2: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>',
    Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>',
    Upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line>',
    Link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
    ExternalLink: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
    Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
    Trash2: '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>',
    Edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
    Plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
    Minus: '<path d="M5 12h14"></path>',
    Check: '<polyline points="20 6 9 17 4 12"></polyline>',
    X: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    ChevronLeft: '<path d="m15 18-6-6 6-6"></path>',
    ChevronRight: '<path d="m9 18 6-6-6-6"></path>',
    ChevronDown: '<path d="m6 9 6 6 6-6"></path>',
    ChevronUp: '<path d="m18 15-6-6-6 6"></path>',
    Menu: '<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>',
    MoreHorizontal: '<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>',
    Filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
    Grid: '<rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect>',
    List: '<line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line>',
    Layout: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line>',
    Sidebar: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path>',
    Layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
    Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>',
    EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line>',
    Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    Unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>',
    Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    Globe: '<circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
    Wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" x2="12.01" y1="20" y2="20"></line>',
    Bluetooth: '<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline>',
    Volume2: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>',
    Mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line>',
    Play: '<polygon points="6 3 20 12 6 21 6 3"></polygon>',
    Pause: '<rect width="4" height="16" x="6" y="4"></rect><rect width="4" height="16" x="14" y="4"></rect>',
    SkipForward: '<polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" x2="19" y1="5" y2="19"></line>',
    SkipBack: '<polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" x2="5" y1="19" y2="5"></line>',
  };

  return paths[name] ?? '';
}
