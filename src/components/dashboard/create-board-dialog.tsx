'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Layout,
  GitBranch,
  Brain,
  Smartphone,
  Columns,
  Network,
  Clock,
  Map,
  Eye,
  EyeOff,
  Globe,
  Lock,
  ChevronDown,
  Monitor,
  Presentation,
  Camera,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { t, type Locale } from '@/lib/i18n'
import {
  DEVICE_TYPE_GROUPS,
  getDevicesByTypeGroup,
  type DeviceTypeGroup,
} from '@/lib/device-templates'
import type { DeviceTemplate } from '@/lib/types'

export interface BoardTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  gradient: string
}

const templates: BoardTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch with a blank canvas',
    icon: Layout,
    gradient: 'from-zinc-300 via-zinc-400 to-zinc-500 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800',
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Map out processes and decision trees',
    icon: GitBranch,
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-700',
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Organize ideas with a radial structure',
    icon: Brain,
    gradient: 'from-zinc-500 via-zinc-600 to-zinc-700 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800',
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    description: 'Design UI layouts and screen flows',
    icon: Smartphone,
    gradient: 'from-zinc-300 via-zinc-400 to-zinc-500 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-700',
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Manage work with boards and columns',
    icon: Columns,
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-700',
  },
  {
    id: 'uml',
    name: 'UML',
    description: 'Create class and sequence diagrams',
    icon: Network,
    gradient: 'from-zinc-500 via-zinc-600 to-zinc-700 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Plan events and project milestones',
    icon: Clock,
    gradient: 'from-zinc-400 via-zinc-500 to-zinc-600 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-700',
  },
  {
    id: 'journey',
    name: 'Journey Map',
    description: 'Map user experiences and touchpoints',
    icon: Map,
    gradient: 'from-zinc-300 via-zinc-400 to-zinc-500 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-700',
  },
]

// Icon mapping for device type groups
const DEVICE_TYPE_ICONS: Record<DeviceTypeGroup, React.ElementType> = {
  iphone: Smartphone,
  android: Smartphone,
  website: Monitor,
  tablet: Smartphone,
  presentation: Presentation,
  social: Camera,
}

interface CreateBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBoard?: (data: {
    name: string
    description: string
    templateId: string
    isPublic: boolean
    deviceType?: DeviceTypeGroup
    deviceId?: string
  }) => void
  locale: Locale
}

export function CreateBoardDialog({
  open,
  onOpenChange,
  onCreateBoard,
  locale,
}: CreateBoardDialogProps) {
  const [boardName, setBoardName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank')
  const [isPublic, setIsPublic] = useState(false)
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceTypeGroup | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [showDeviceModels, setShowDeviceModels] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const templateLabels: Record<string, string> = {
    blank: t('board.templateBlank', locale),
    flowchart: t('board.templateFlowchart', locale),
    mindmap: t('board.templateMindmap', locale),
    wireframe: t('board.templateWireframe', locale),
    kanban: t('board.templateKanban', locale),
    uml: t('board.templateUML', locale),
    timeline: t('board.templateTimeline', locale),
    journey: t('board.templateJourney', locale),
  }
  const templateDescs: Record<string, string> = {
    blank: t('board.templateBlankDesc', locale),
    flowchart: t('board.templateFlowchartDesc', locale),
    mindmap: t('board.templateMindmapDesc', locale),
    wireframe: t('board.templateWireframeDesc', locale),
    kanban: t('board.templateKanbanDesc', locale),
    uml: t('board.templateUMLDesc', locale),
    timeline: t('board.templateTimelineDesc', locale),
    journey: t('board.templateJourneyDesc', locale),
  }

  // Get devices for the selected device type group
  const devicesForGroup = useMemo<DeviceTemplate[]>(() => {
    if (!selectedDeviceType) return []
    return getDevicesByTypeGroup(selectedDeviceType)
  }, [selectedDeviceType])

  const canCreate = boardName.trim().length > 0

  // Scroll to top when dialog opens
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      // Small delay to allow dialog animation to start
      const timer = setTimeout(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleCreate = async () => {
    if (!canCreate || isCreating) return
    setIsCreating(true)

    // Simulate a brief loading state for UX polish
    await new Promise((resolve) => setTimeout(resolve, 300))

    onCreateBoard?.({
      name: boardName.trim(),
      description: description.trim(),
      templateId: selectedTemplate,
      isPublic,
      deviceType: selectedDeviceType ?? undefined,
      deviceId: selectedDevice ?? undefined,
    })
    setIsCreating(false)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setBoardName('')
    setDescription('')
    setSelectedTemplate('blank')
    setIsPublic(false)
    setSelectedDeviceType(null)
    setSelectedDevice(null)
    setShowDeviceModels(false)
    setIsCreating(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset()
    }
    onOpenChange(newOpen)
  }

  const handleDeviceTypeSelect = (group: DeviceTypeGroup) => {
    if (selectedDeviceType === group) {
      // Deselect if already selected
      setSelectedDeviceType(null)
      setSelectedDevice(null)
      setShowDeviceModels(false)
    } else {
      setSelectedDeviceType(group)
      setSelectedDevice(null)
      setShowDeviceModels(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col neu-raised bg-background rounded-2xl border-0">
        {/* Scale + fade entrance animation overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25, duration: 0.3 }}
          className="flex flex-col h-full"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{t('board.createTitle', locale)}</DialogTitle>
            <DialogDescription>
              {t('board.createDesc', locale)}
            </DialogDescription>
          </DialogHeader>

          <div ref={scrollContainerRef} className="flex flex-col gap-6 overflow-y-auto pr-1 -mr-1 flex-1 py-1 scrollbar-thin">
            {/* Board name */}
            <div className="space-y-2">
              <Label htmlFor="board-name" className="text-xs font-semibold">
                {t('board.name', locale)} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="board-name"
                placeholder={t('board.namePlaceholder', locale)}
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canCreate) {
                    handleCreate()
                  }
                }}
                autoFocus
                className="text-sm neu-input border-0 transition-all duration-300"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="board-description" className="text-xs font-semibold">{t('board.description', locale)}</Label>
              <Textarea
                id="board-description"
                placeholder={t('board.descriptionPlaceholder', locale)}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm min-h-[72px] resize-none neu-input border-0 transition-all duration-300"
                rows={3}
              />
            </div>

            {/* Device Type Selector */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold">{t('board.deviceType', locale)}</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {DEVICE_TYPE_GROUPS.map((group) => {
                  const GroupIcon = DEVICE_TYPE_ICONS[group.id]
                  const isSelected = selectedDeviceType === group.id

                  return (
                    <motion.button
                      key={group.id}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDeviceTypeSelect(group.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all duration-300 text-left border-0',
                        isSelected
                          ? 'neu-pressed ring-2 ring-primary/20 ring-offset-1 ring-offset-background'
                          : 'neu-flat hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.25),inset_-2px_-2px_5px_rgba(50,50,60,0.05)]'
                      )}
                    >
                      {/* Selected indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            layoutId="device-type-selected"
                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground z-10"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              className="text-current"
                            >
                              <path
                                d="M2.5 6L5 8.5L9.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Emoji icon */}
                      <span className="text-lg leading-none">{group.icon}</span>

                      {/* Label */}
                      <p className={cn(
                        'text-[10px] font-semibold text-center leading-tight truncate w-full',
                        isSelected ? 'text-foreground' : 'text-foreground/70'
                      )}>
                        {t(group.labelKey, locale)}
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              {/* Device models for selected type */}
              <AnimatePresence mode="wait">
                {showDeviceModels && selectedDeviceType && devicesForGroup.length > 0 && (
                  <motion.div
                    key={selectedDeviceType}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDeviceModels(false)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mb-2"
                      >
                        <ChevronDown className="size-3 rotate-180" />
                        {t('board.collapseDevices', locale)}
                      </button>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1 -mr-1">
                        {devicesForGroup.map((device) => {
                          const isSelected = selectedDevice === device.id

                          return (
                            <motion.button
                              key={device.id}
                              type="button"
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setSelectedDevice(isSelected ? null : device.id)}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 text-left text-xs border-0 w-full',
                                isSelected
                                  ? 'neu-pressed ring-1 ring-primary/15'
                                  : 'neu-flat hover:bg-foreground/[0.02]'
                              )}
                            >
                              {/* Mini device preview */}
                              <div
                                className="flex-shrink-0 flex items-center justify-center rounded border border-border/30 bg-muted/30"
                                style={{
                                  width: 22,
                                  height: Math.max(16, Math.round(22 * (device.height / device.width))),
                                }}
                              >
                                <div
                                  className="rounded-[1px] bg-muted-foreground/20"
                                  style={{
                                    width: 14,
                                    height: Math.max(12, Math.round(14 * (device.height / device.width))),
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate leading-tight">{device.name}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                  {device.width}×{device.height}
                                </p>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                  className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0"
                                >
                                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="text-current">
                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </motion.div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Template selector */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold">{t('board.template', locale)}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {templates.map((template) => {
                  const Icon = template.icon
                  const isSelected = selectedTemplate === template.id

                  return (
                    <motion.button
                      key={template.id}
                      type="button"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300 text-left border-0',
                        isSelected
                          ? 'neu-pressed ring-2 ring-primary/20 ring-offset-1 ring-offset-background shadow-[inset_3px_3px_6px_rgba(0,0,0,0.08),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(50,50,60,0.05)]'
                          : 'neu-flat hover:shadow-[4px_4px_10px_rgba(0,0,0,0.06),-4px_-4px_10px_rgba(255,255,255,0.6)] dark:hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3),-4px_-4px_10px_rgba(50,50,60,0.06)]'
                      )}
                    >
                      {/* Selected indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            layoutId="template-selected"
                            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground z-10"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              className="text-current"
                            >
                              <path
                                d="M2.5 6L5 8.5L9.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Icon with float on hover */}
                      <motion.div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                          template.gradient
                        )}
                        whileHover={{ y: -3, rotate: [0, -2, 2, 0] }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <Icon className="size-5" />
                      </motion.div>

                      {/* Text */}
                      <div className="w-full text-center min-w-0">
                        <p className={cn(
                          'text-xs font-semibold truncate',
                          isSelected ? 'text-foreground' : 'text-foreground/80'
                        )}>
                          {templateLabels[template.id] ?? template.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                          {templateDescs[template.id] ?? template.description}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Visibility toggle */}
            <div className={cn(
              'flex items-center justify-between rounded-xl p-3.5 transition-all duration-300 border-0',
              isPublic
                ? 'neu-pressed bg-primary/[0.03]'
                : 'neu-concave bg-background'
            )}>
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors duration-300"
                  animate={{ backgroundColor: isPublic ? 'rgba(34,197,94,0.1)' : undefined }}
                >
                  {isPublic ? (
                    <Globe className="size-4 text-emerald-500" />
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                </motion.div>
                <div>
                  <p className="text-sm font-medium transition-colors duration-300">
                    {isPublic ? t('board.publicBoard', locale) : t('board.privateBoard', locale)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPublic
                      ? t('board.publicDesc', locale)
                      : t('board.privateDesc', locale)}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                aria-label={t('board.toggleVisibility', locale)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2 neu-divider">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="btn-neu border-0 transition-all duration-200"
              disabled={isCreating}
            >
              {t('board.cancel', locale)}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className="gap-1.5 btn-neu-primary border-0 transition-all duration-200 relative overflow-hidden min-w-[100px]"
            >
              {isCreating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm">{t('board.create', locale)}</span>
                </motion.div>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>{t('board.create', locale)}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}