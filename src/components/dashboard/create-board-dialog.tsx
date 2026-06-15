'use client'

import { useState, useMemo } from 'react'
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

  const handleCreate = () => {
    if (!canCreate) return
    onCreateBoard?.({
      name: boardName.trim(),
      description: description.trim(),
      templateId: selectedTemplate,
      isPublic,
      deviceType: selectedDeviceType ?? undefined,
      deviceId: selectedDevice ?? undefined,
    })
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
        <DialogHeader>
          <DialogTitle className="text-xl">{t('board.createTitle', locale)}</DialogTitle>
          <DialogDescription>
            {t('board.createDesc', locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto pr-1 -mr-1 flex-1 py-1">
          {/* Board name */}
          <div className="space-y-2">
            <Label htmlFor="board-name">
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
              className="text-sm neu-input border-0"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="board-description">{t('board.description', locale)}</Label>
            <Textarea
              id="board-description"
              placeholder={t('board.descriptionPlaceholder', locale)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm min-h-[72px] resize-none neu-input border-0"
              rows={3}
            />
          </div>

          {/* Device Type Selector */}
          <div className="space-y-3">
            <Label>{t('board.deviceType', locale)}</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DEVICE_TYPE_GROUPS.map((group) => {
                const GroupIcon = DEVICE_TYPE_ICONS[group.id]
                const isSelected = selectedDeviceType === group.id

                return (
                  <motion.button
                    key={group.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDeviceTypeSelect(group.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all text-left border-0',
                      isSelected
                        ? 'neu-pressed'
                        : 'neu-flat'
                    )}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="device-type-selected"
                        className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
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

                    {/* Emoji icon */}
                    <span className="text-lg leading-none">{group.icon}</span>

                    {/* Label */}
                    <p className="text-[10px] font-semibold text-center leading-tight truncate w-full">
                      {t(group.labelKey, locale)}
                    </p>
                  </motion.button>
                )
              })}
            </div>

            {/* Device models for selected type */}
            {showDeviceModels && selectedDeviceType && devicesForGroup.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDeviceModels(false)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ChevronDown className="size-3 rotate-180" />
                    {t('board.collapseDevices', locale)}
                  </button>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1 -mr-1">
                      {devicesForGroup.map((device) => {
                        const isSelected = selectedDevice === device.id

                        return (
                          <motion.button
                            key={device.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedDevice(isSelected ? null : device.id)}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all text-left text-xs border-0',
                              isSelected
                                ? 'neu-pressed'
                                : 'neu-flat'
                            )}
                          >
                            {/* Mini device preview */}
                            <div
                              className="flex-shrink-0 flex items-center justify-center rounded border border-border/30 bg-muted/30"
                              style={{
                                width: 20,
                                height: Math.max(14, Math.round(20 * (device.height / device.width))),
                              }}
                            >
                              <div
                                className="rounded-[1px] bg-muted-foreground/20"
                                style={{
                                  width: 12,
                                  height: Math.max(10, Math.round(12 * (device.height / device.width))),
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate leading-tight">{device.name}</p>
                              <p className="text-[9px] text-muted-foreground leading-tight">
                                {device.width}×{device.height}
                              </p>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
              )}
          </div>

          {/* Template selector */}
          <div className="space-y-3">
            <Label>{t('board.template', locale)}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {templates.map((template) => {
                const Icon = template.icon
                const isSelected = selectedTemplate === template.id

                return (
                  <motion.button
                    key={template.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all text-left border-0',
                      isSelected
                        ? 'neu-pressed'
                        : 'neu-flat'
                    )}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="template-selected"
                        className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
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

                    {/* Icon */}
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
                        template.gradient
                      )}
                    >
                      <Icon className="size-5" />
                    </div>

                    {/* Text */}
                    <div className="w-full text-center min-w-0">
                      <p className="text-xs font-semibold truncate">
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
          <div className="flex items-center justify-between rounded-lg p-3 bg-background neu-concave border-0">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                {isPublic ? (
                  <Globe className="size-4 text-muted-foreground" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
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
            className="btn-neu border-0"
          >
            {t('board.cancel', locale)}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate}
            className="gap-1.5 btn-neu-primary border-0"
          >
            <Plus className="size-4" />
            {t('board.create', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
