'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

import type { BoardElement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ImportDialog } from './import-dialog';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ImportButtonProps {
  onImport: (elements: BoardElement[]) => void;
  boardId?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  tooltip?: string;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ImportButton({
  onImport,
  boardId,
  variant = 'ghost',
  size = 'icon',
  tooltip = 'Import design',
  className,
}: ImportButtonProps) {
  const [open, setOpen] = useState(false);

  const btn = (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => setOpen(true)}
      aria-label="Import design"
    >
      <Upload className="size-4" />
    </Button>
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {tooltip}
        </TooltipContent>
      </Tooltip>

      <ImportDialog
        open={open}
        onOpenChange={setOpen}
        onImport={onImport}
        boardId={boardId}
      />
    </>
  );
}

// Re-export the dialog for direct use
export { ImportDialog } from './import-dialog';