'use client'

import { useState } from 'react'
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
    gradient: 'from-sky-400 via-cyan-500 to-teal-500',
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Organize ideas with a radial structure',
    icon: Brain,
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    description: 'Design UI layouts and screen flows',
    icon: Smartphone,
    gradient: 'from-amber-400 via-orange-500 to-red-500',
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Manage work with boards and columns',
    icon: Columns,
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
  },
  {
    id: 'uml',
    name: 'UML',
    description: 'Create class and sequence diagrams',
    icon: Network,
    gradient: 'from-rose-400 via-pink-500 to-red-500',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Plan events and project milestones',
    icon: Clock,
    gradient: 'from-blue-400 via-indigo-500 to-violet-500',
  },
  {
    id: 'journey',
    name: 'Journey Map',
    description: 'Map user experiences and touchpoints',
    icon: Map,
    gradient: 'from-lime-400 via-emerald-500 to-green-500',
  },
]

interface CreateBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBoard?: (data: {
    name: string
    description: string
    templateId: string
    isPublic: boolean
  }) => void
}

export function CreateBoardDialog({
  open,
  onOpenChange,
  onCreateBoard,
}: CreateBoardDialogProps) {
  const [boardName, setBoardName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank')
  const [isPublic, setIsPublic] = useState(false)

  const canCreate = boardName.trim().length > 0

  const handleCreate = () => {
    if (!canCreate) return
    onCreateBoard?.({
      name: boardName.trim(),
      description: description.trim(),
      templateId: selectedTemplate,
      isPublic,
    })
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setBoardName('')
    setDescription('')
    setSelectedTemplate('blank')
    setIsPublic(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Board</DialogTitle>
          <DialogDescription>
            Start with a blank canvas or choose a template to get going quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto pr-1 -mr-1 flex-1 py-1">
          {/* Board name */}
          <div className="space-y-2">
            <Label htmlFor="board-name">
              Board Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="board-name"
              placeholder="e.g., Product Roadmap Q4"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreate) {
                  handleCreate()
                }
              }}
              autoFocus
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="board-description">Description</Label>
            <Textarea
              id="board-description"
              placeholder="Brief description of your board (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm min-h-[72px] resize-none"
              rows={3}
            />
          </div>

          {/* Template selector */}
          <div className="space-y-3">
            <Label>Template</Label>
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
                      'relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all text-left',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm dark:bg-primary/10'
                        : 'border-border hover:border-primary/40 hover:bg-accent/50'
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
                        {template.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-accent/30">
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
                  {isPublic ? 'Public Board' : 'Private Board'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? 'Anyone with the link can view this board'
                    : 'Only invited members can access this board'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              aria-label="Toggle board visibility"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t mt-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Create Board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
