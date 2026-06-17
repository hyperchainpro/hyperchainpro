'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import {
  X, Search, ChevronRight, ChevronDown, BookOpen, ArrowUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { GUIDE_SECTIONS, ICON_MAP } from '@/lib/guide-data';
import { cn } from '@/lib/utils';

interface UserGuideProps { open: boolean; onOpenChange: (v: boolean) => void }

const SHORTCUTS: [string, string][] = [
  ['V', 'tool.select'], ['H', 'tool.hand'], ['T', 'tool.text'],
  ['R', 'tool.rectangle'], ['O', 'tool.ellipse'], ['L', 'tool.line'],
  ['P', 'tool.pen'], ['F', 'tool.frame'],
  ['Ctrl/Cmd + C', 'context.copy'], ['Ctrl/Cmd + V', 'context.paste'],
  ['Ctrl/Cmd + Z', 'toolbar.undo'], ['Ctrl/Cmd + Shift + Z', 'toolbar.redo'],
  ['Ctrl/Cmd + G', 'layers.group'], ['Ctrl/Cmd + Shift + G', 'layers.ungroup'],
  ['Ctrl/Cmd + D', 'context.duplicate'], ['Delete', 'context.delete'],
  ['Ctrl/Cmd + A', 'context.selectAll'], ['Space + Drag', 'guide.shortcuts.pan'],
  ['Scroll', 'guide.shortcuts.zoom'], ['Ctrl/Cmd + E', 'toolbar.export'],
];

export function UserGuide({ open, onOpenChange }: UserGuideProps) {
  const locale = useAuthStore((s) => s.user?.language) ?? 'en';
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['gettingStarted']));
  const [activeSection, setActiveSection] = useState<string | null>('gettingStarted');
  const contentRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  const toggle = useCallback((id: string) => {
    setExpanded((p) => { const n = new Set(p); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });
  }, []);

  const scrollTo = useCallback((sid: string, subid?: string) => {
    document.getElementById(subid ? `g-${sid}-${subid}` : `g-${sid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sid);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return GUIDE_SECTIONS;
    const q = search.toLowerCase();
    return GUIDE_SECTIONS.filter((s) =>
      t(`guide.${s.id}.title`, locale).toLowerCase().includes(q) ||
      s.subsections.some((sub) => t(`guide.${s.id}.${sub.id}.title`, locale).toLowerCase().includes(q))
    );
  }, [search, locale]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex h-[90vh] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:h-[85vh] neu-raised bg-background border-0">
        <DialogTitle className="sr-only">{t('guide.title', locale)}</DialogTitle>
        <div className="shrink-0 border-b border-border/30 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground/5"><BookOpen className="size-5 text-foreground" /></div>
              <div className="min-w-0"><h2 className="text-lg font-semibold text-foreground truncate">{t('guide.title', locale)}</h2><p className="text-xs text-muted-foreground">LayerBoard</p></div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 neu-icon-btn" onClick={() => onOpenChange(false)}><X className="size-4" /></Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('guide.search', locale)} value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 neu-input border-0" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="hidden w-64 shrink-0 border-r border-border/30 md:block">
            <ScrollArea className="h-full"><nav className="p-3 space-y-0.5" aria-label="TOC">
              {filtered.map((s) => {
                const Icon = ICON_MAP[s.icon] ?? BookOpen;
                const exp = expanded.has(s.id);
                return (
                  <div key={s.id}>
                    <button onClick={() => { toggle(s.id); scrollTo(s.id); }} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors border-0 bg-transparent cursor-pointer', activeSection === s.id ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50')}>
                      <Icon className="size-3.5 shrink-0" /><span className="flex-1 truncate">{t(`guide.${s.id}.title`, locale)}</span>
                      {s.subsections.length > 0 && (exp ? <ChevronDown className="size-3 shrink-0" /> : <ChevronRight className="size-3 shrink-0" />)}
                    </button>
                    {exp && s.subsections.length > 0 && <div className="ml-6 space-y-0.5 mt-0.5">{s.subsections.map((sub) => (
                      <button key={sub.id} onClick={() => scrollTo(s.id, sub.id)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" /><span className="truncate">{t(`guide.${s.id}.${sub.id}.title`, locale)}</span>
                      </button>
                    ))}</div>}
                  </div>
                );
              })}
            </nav></ScrollArea>
          </div>
          <div className="shrink-0 border-b border-border/30 px-2 py-2 md:hidden overflow-x-auto">
            <div className="flex gap-1.5">{filtered.map((s) => {
              const Icon = ICON_MAP[s.icon] ?? BookOpen;
              return <button key={s.id} onClick={() => scrollTo(s.id)} className={cn('shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border-0 cursor-pointer', activeSection === s.id ? 'neu-pressed text-foreground' : 'text-muted-foreground hover:text-foreground bg-transparent')}><Icon className="size-3" />{t(`guide.${s.id}.title`, locale)}</button>;
            })}</div>
          </div>
          <div ref={contentRef} onScroll={() => setShowTop((contentRef.current?.scrollTop ?? 0) > 300)} className="flex-1 overflow-y-auto neu-scroll">
            <div className="mx-auto max-w-3xl p-6 sm:p-10 space-y-12">
              {showTop && <Button variant="outline" size="sm" onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-20 right-6 z-50 gap-1.5 btn-neu"><ArrowUp className="size-3.5" />{t('guide.backToTop', locale)}</Button>}
              {filtered.map((s) => {
                const Icon = ICON_MAP[s.icon] ?? BookOpen;
                return (
                  <section key={s.id} id={`g-${s.id}`}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/30">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-foreground/5 text-foreground"><Icon className="size-5" /></div>
                      <h2 className="text-xl font-bold text-foreground">{t(`guide.${s.id}.title`, locale)}</h2>
                    </div>
                    {s.subsections.length > 0 ? <div className="space-y-8">{s.subsections.map((sub) => (
                      <div key={sub.id} id={`g-${s.id}-${sub.id}`} className="scroll-mt-4">
                        <h3 className="text-base font-semibold text-foreground mb-3">{t(`guide.${s.id}.${sub.id}.title`, locale)}</h3>
                        <div className="text-sm leading-relaxed text-muted-foreground space-y-3 whitespace-pre-line">{t(`guide.${s.id}.${sub.id}.content`, locale)}</div>
                      </div>
                    ))}</div> : (
                      <div className="neu-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
                        <thead><tr className="border-b border-border/30 bg-muted/30"><th className="px-4 py-2.5 text-left font-medium text-foreground">{t('guide.shortcuts.key', locale)}</th><th className="px-4 py-2.5 text-left font-medium text-foreground">{t('guide.shortcuts.action', locale)}</th></tr></thead>
                        <tbody>{SHORTCUTS.map(([key, labelKey], i) => (
                          <tr key={key} className={cn('border-b border-border/10 last:border-0', i % 2 === 0 && 'bg-muted/10')}>
                            <td className="px-4 py-2"><kbd className="inline-flex items-center rounded-md border border-border/40 bg-muted/50 px-2 py-0.5 font-mono text-xs text-foreground">{key}</kbd></td>
                            <td className="px-4 py-2 text-muted-foreground">{t(labelKey, locale)}</td>
                          </tr>
                        ))}</tbody>
                      </table></div></div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}