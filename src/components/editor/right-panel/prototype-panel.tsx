'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Pencil,
  X,
  MousePointerClick,
  ArrowRightLeft,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { usePrototypeStore } from '@/store/prototype-store';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import type {
  PrototypeInteraction,
  PrototypeTrigger,
  TransitionType,
  EasingType,
  BoardElement,
} from '@/lib/types';

// ─── Neumorphism helpers ──────────────────────────────────────────────────────

const neuBtn =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]';

// ─── Option maps ──────────────────────────────────────────────────────────────

const TRIGGER_OPTIONS: { value: PrototypeTrigger; label: string }[] = [
  { value: 'on_click', label: 'On Click' },
  { value: 'on_drag', label: 'On Drag' },
  { value: 'on_hover', label: 'On Hover' },
  { value: 'on_press', label: 'On Press' },
  { value: 'on_timer', label: 'On Timer' },
  { value: 'on_scroll', label: 'On Scroll' },
];

const TRANSITION_OPTIONS: { value: TransitionType; label: string }[] = [
  { value: 'instant', label: 'Instant' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'smart_animate', label: 'Smart Animate' },
  { value: 'slide_left', label: 'Slide Left' },
  { value: 'slide_right', label: 'Slide Right' },
  { value: 'slide_up', label: 'Slide Up' },
  { value: 'slide_down', label: 'Slide Down' },
  { value: 'push_left', label: 'Push Left' },
  { value: 'push_right', label: 'Push Right' },
];

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
];

const NAVIGATION_OPTIONS = [
  { value: 'navigate', label: 'Navigate' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'swap', label: 'Swap' },
] as const;

const OVERLAY_POSITION_OPTIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const;

// ─── Interaction Form ─────────────────────────────────────────────────────────

interface FormState {
  trigger: PrototypeTrigger;
  targetFrameId: string;
  transition: TransitionType;
  duration: number;
  easing: EasingType;
  navigationType: 'navigate' | 'overlay' | 'swap';
  overlayPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const defaultFormState: FormState = {
  trigger: 'on_click',
  targetFrameId: '',
  transition: 'instant',
  duration: 300,
  easing: 'ease-in-out',
  navigationType: 'navigate',
  overlayPosition: 'center',
};

function InteractionForm({
  initial,
  frameElements,
  onSave,
  onCancel,
}: {
  initial?: FormState;
  frameElements: BoardElement[];
  onSave: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial ?? defaultFormState);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.targetFrameId) return;
    onSave(form);
  };

  const labelCls = 'text-[10px] text-muted-foreground leading-none';
  const selectCls = 'h-7 w-full text-xs';
  const selectTriggerCls = 'h-7 w-full text-xs';

  return (
    <div className="space-y-2.5 rounded-lg border border-border/50 p-3 bg-muted/20">
      {/* Trigger */}
      <div className="space-y-1">
        <span className={labelCls}>Trigger</span>
        <Select value={form.trigger} onValueChange={(v) => update('trigger', v as PrototypeTrigger)}>
          <SelectTrigger className={selectTriggerCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Frame */}
      <div className="space-y-1">
        <span className={labelCls}>Target Frame</span>
        <Select value={form.targetFrameId} onValueChange={(v) => update('targetFrameId', v)}>
          <SelectTrigger className={selectTriggerCls}>
            <SelectValue placeholder="Select frame..." />
          </SelectTrigger>
          <SelectContent>
            {frameElements.map((el) => (
              <SelectItem key={el.id} value={el.id}>
                {el.name || el.content || `Frame ${el.id.slice(0, 6)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transition */}
      <div className="space-y-1">
        <span className={labelCls}>Transition</span>
        <Select value={form.transition} onValueChange={(v) => update('transition', v as TransitionType)}>
          <SelectTrigger className={selectTriggerCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSITION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={labelCls}>Duration</span>
          <span className="text-[10px] text-muted-foreground">{form.duration}ms</span>
        </div>
        <Slider
          min={100}
          max={2000}
          step={50}
          value={[form.duration]}
          onValueChange={([v]) => update('duration', v)}
          className="h-2"
        />
      </div>

      {/* Easing */}
      <div className="space-y-1">
        <span className={labelCls}>Easing</span>
        <Select value={form.easing} onValueChange={(v) => update('easing', v as EasingType)}>
          <SelectTrigger className={selectTriggerCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EASING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Type */}
      <div className="space-y-1">
        <span className={labelCls}>Navigation Type</span>
        <Select
          value={form.navigationType}
          onValueChange={(v) => update('navigationType', v as FormState['navigationType'])}
        >
          <SelectTrigger className={selectTriggerCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NAVIGATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overlay Position (only if overlay) */}
      {form.navigationType === 'overlay' && (
        <div className="space-y-1">
          <span className={labelCls}>Overlay Position</span>
          <Select
            value={form.overlayPosition}
            onValueChange={(v) => update('overlayPosition', v as FormState['overlayPosition'])}
          >
            <SelectTrigger className={selectTriggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OVERLAY_POSITION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-1">
        <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleSave} disabled={!form.targetFrameId}>
          Save
        </Button>
        <Button size="sm" variant="ghost" className="h-7 flex-1 text-xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Main Prototype Panel ─────────────────────────────────────────────────────

export function PrototypePanel() {
  const elements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const addInteraction = usePrototypeStore((s) => s.addInteraction);
  const updateInteraction = usePrototypeStore((s) => s.updateInteraction);
  const removeInteraction = usePrototypeStore((s) => s.removeInteraction);
  const getInteractionsForFrame = usePrototypeStore((s) => s.getInteractionsForFrame);
  const startFrameId = usePrototypeStore((s) => s.startFrameId);
  const setStartFrame = usePrototypeStore((s) => s.setStartFrame);
  const startPlayback = usePrototypeStore((s) => s.startPlayback);
  const setEditorMode = useAppStore((s) => s.setEditorMode);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedElement = elements.find((el) => selectedIds[0] === el.id);
  const isFrame = selectedElement?.type === 'FRAME';

  const frameElements = useMemo(
    () => elements.filter((el) => el.type === 'FRAME'),
    [elements],
  );

  const interactions = useMemo(() => {
    if (!selectedElement || !isFrame) return [];
    return getInteractionsForFrame(selectedElement.id);
  }, [selectedElement, isFrame, getInteractionsForFrame]);

  const handleAdd = useCallback(
    (form: FormState) => {
      if (!selectedElement) return;
      const interaction: PrototypeInteraction = {
        id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        sourceFrameId: selectedElement.id,
        targetFrameId: form.targetFrameId,
        trigger: form.trigger,
        transition: form.transition,
        duration: form.duration,
        easing: form.easing,
        navigationType: form.navigationType,
        overlayPosition: form.navigationType === 'overlay' ? form.overlayPosition : undefined,
      };
      addInteraction(interaction);
      setShowAddForm(false);
    },
    [selectedElement, addInteraction],
  );

  const handleEdit = useCallback(
    (form: FormState) => {
      if (!editingId) return;
      updateInteraction(editingId, {
        trigger: form.trigger,
        targetFrameId: form.targetFrameId,
        transition: form.transition,
        duration: form.duration,
        easing: form.easing,
        navigationType: form.navigationType,
        overlayPosition: form.navigationType === 'overlay' ? form.overlayPosition : undefined,
      });
      setEditingId(null);
    },
    [editingId, updateInteraction],
  );

  const handleDelete = useCallback(
    (id: string) => {
      removeInteraction(id);
      if (editingId === id) setEditingId(null);
    },
    [removeInteraction, editingId],
  );

  const getTriggerLabel = (t: PrototypeTrigger) =>
    TRIGGER_OPTIONS.find((o) => o.value === t)?.label ?? t;

  const getTransitionLabel = (t: TransitionType) =>
    TRANSITION_OPTIONS.find((o) => o.value === t)?.label ?? t;

  const getTargetName = (id: string) => {
    const el = elements.find((e) => e.id === id);
    return el?.name || el?.content || `Frame ${id.slice(0, 6)}`;
  };

  const handlePlay = useCallback(() => {
    const frameId = startFrameId ?? frameElements[0]?.id;
    if (!frameId) return;
    setEditorMode('prototype');
    startPlayback(frameId);
  }, [startFrameId, frameElements, setEditorMode, startPlayback]);

  const editingInteraction = editingId
    ? interactions.find((i) => i.id === editingId)
    : null;

  // ── Empty state (no frame selected) ──
  if (!isFrame) {
    return (
      <div className="flex h-full flex-col">
        {/* Start Frame & Play section always visible */}
        <StartFrameSection
          frameElements={frameElements}
          startFrameId={startFrameId}
          setStartFrame={setStartFrame}
          onPlay={handlePlay}
        />
        <Separator />
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
            <MousePointerClick className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a frame to add prototype interactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Start Frame & Play */}
      <StartFrameSection
        frameElements={frameElements}
        startFrameId={startFrameId}
        setStartFrame={setStartFrame}
        onPlay={handlePlay}
      />
      <Separator />

      {/* Prototype header */}
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold flex items-center gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Prototype
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
          {selectedElement.name || selectedElement.content || `Frame ${selectedElement.id.slice(0, 6)}`}
        </p>
      </div>

      {/* Interactions list */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-3 space-y-2">
          {interactions.length === 0 && !showAddForm && !editingId && (
            <p className="text-[11px] text-muted-foreground text-center py-4">
              No interactions yet. Add one below.
            </p>
          )}

          {interactions.map((interaction) => (
            <div key={interaction.id}>
              {editingId === interaction.id ? (
                <InteractionForm
                  initial={{
                    trigger: interaction.trigger,
                    targetFrameId: interaction.targetFrameId,
                    transition: interaction.transition,
                    duration: interaction.duration,
                    easing: interaction.easing,
                    navigationType: interaction.navigationType ?? 'navigate',
                    overlayPosition: interaction.overlayPosition ?? 'center',
                  }}
                  frameElements={frameElements.filter((el) => el.id !== selectedElement.id)}
                  onSave={handleEdit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-border/30 px-2.5 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-medium truncate">
                        {getTriggerLabel(interaction.trigger)}
                      </span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="truncate text-primary">
                        {getTargetName(interaction.targetFrameId)}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {getTransitionLabel(interaction.transition)} &middot; {interaction.duration}ms
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingId(interaction.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(interaction.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add form */}
          {showAddForm && (
            <InteractionForm
              frameElements={frameElements.filter((el) => el.id !== selectedElement.id)}
              onSave={handleAdd}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Add button */}
          {!showAddForm && !editingId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs gap-1"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-3 w-3" />
              Add Interaction
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Start Frame Section ──────────────────────────────────────────────────────

function StartFrameSection({
  frameElements,
  startFrameId,
  setStartFrame,
  onPlay,
}: {
  frameElements: BoardElement[];
  startFrameId: string | null;
  setStartFrame: (id: string) => void;
  onPlay: () => void;
}) {
  return (
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Start Frame</Label>
      </div>
      <Select
        value={startFrameId ?? ''}
        onValueChange={(v) => setStartFrame(v)}
      >
        <SelectTrigger className="h-7 w-full text-xs">
          <SelectValue placeholder="Select start frame..." />
        </SelectTrigger>
        <SelectContent>
          {frameElements.map((el) => (
            <SelectItem key={el.id} value={el.id}>
              {el.name || el.content || `Frame ${el.id.slice(0, 6)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className={cn(
          'w-full h-9 rounded-xl gap-2 font-medium text-sm border-0 bg-background text-foreground',
          'hover:-translate-y-0.5 active:translate-y-0 transition-all',
          neuBtn,
        )}
        onClick={onPlay}
        disabled={frameElements.length === 0}
      >
        <Play className="h-4 w-4" />
        Play Prototype
      </Button>
    </div>
  );
}