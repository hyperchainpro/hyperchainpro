'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import type { Locale } from '@/lib/i18n';
import { useVariablesStore, type VariableType, type VariableScope } from '@/store/variables-store';

const VARIABLE_TYPES: { value: VariableType; labelKey: string }[] = [
  { value: 'color', labelKey: 'variables.typeColor' },
  { value: 'number', labelKey: 'variables.typeNumber' },
  { value: 'text', labelKey: 'variables.typeText' },
  { value: 'boolean', labelKey: 'variables.typeBoolean' },
];

const VARIABLE_SCOPES: { value: VariableScope; labelKey: string }[] = [
  { value: 'global', labelKey: 'variables.scopeGlobal' },
  { value: 'board', labelKey: 'variables.scopeBoard' },
  { value: 'component', labelKey: 'variables.scopeComponent' },
];

function VariableEditor({ varId }: { varId: string }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const variable = useVariablesStore((s) => s.variables.find((v) => v.id === varId));
  const updateVariable = useVariablesStore((s) => s.updateVariable);

  if (!variable) return null;

  const handleValueChange = (newValue: string) => {
    updateVariable(varId, { value: newValue });
  };

  switch (variable.type) {
    case 'color':
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <input
            type="color"
            value={variable.value || '#000000'}
            onChange={(e) => handleValueChange(e.target.value)}
            className="h-7 w-7 rounded border cursor-pointer bg-transparent"
          />
          <Input
            value={variable.value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="h-7 text-xs font-mono"
            placeholder="#000000"
          />
        </div>
      );
    case 'number':
      return (
        <Input
          type="number"
          value={variable.value}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-7 text-xs font-mono mt-1.5"
          placeholder="0"
        />
      );
    case 'text':
      return (
        <Input
          value={variable.value}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-7 text-xs mt-1.5"
          placeholder={t('variables.enterValue', locale)}
        />
      );
    case 'boolean':
      return (
        <button
          className={cn(
            'mt-1.5 relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            variable.value === 'true' ? 'bg-primary' : 'bg-muted',
          )}
          onClick={() => handleValueChange(variable.value === 'true' ? 'false' : 'true')}
        >
          <span
            className={cn(
              'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform',
              variable.value === 'true' ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
      );
    default:
      return null;
  }
}

export function VariablesPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const variables = useVariablesStore((s) => s.variables);
  const addVariable = useVariablesStore((s) => s.addVariable);
  const removeVariable = useVariablesStore((s) => s.removeVariable);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VariableType>('color');
  const [newScope, setNewScope] = useState<VariableScope>('global');

  const filtered = useMemo(() => {
    if (!search.trim()) return variables;
    const q = search.toLowerCase();
    return variables.filter(
      (v) => v.name.toLowerCase().includes(q) || v.type.toLowerCase().includes(q),
    );
  }, [variables, search]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addVariable({
      name: newName.trim(),
      type: newType,
      scope: newScope,
      value: newType === 'boolean' ? 'false' : newType === 'number' ? '0' : newType === 'color' ? '#000000' : '',
    });
    setNewName('');
    setShowAdd(false);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {/* Search + Add button */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('variables.search', locale)}
              className="h-7 pl-7 text-xs"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 neu-icon-btn"
            onClick={() => setShowAdd(!showAdd)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="neu-card rounded-lg p-3 space-y-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('variables.variableName', locale)}
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as VariableType)}
                className="flex-1 h-7 text-xs rounded-md border bg-background px-2"
              >
                {VARIABLE_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>
                    {t(vt.labelKey, locale)}
                  </option>
                ))}
              </select>
              <select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as VariableScope)}
                className="flex-1 h-7 text-xs rounded-md border bg-background px-2"
              >
                {VARIABLE_SCOPES.map((vs) => (
                  <option key={vs.value} value={vs.value}>
                    {t(vs.labelKey, locale)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowAdd(false)}
              >
                {t('variables.cancel', locale)}
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs btn-neu"
                onClick={handleAdd}
              >
                {t('variables.add', locale)}
              </Button>
            </div>
          </div>
        )}

        {/* Variable list */}
        {filtered.length === 0 && !showAdd ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-muted-foreground">{t('variables.noVariables', locale)}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((v) => (
              <div key={v.id} className="neu-card rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t(`variables.type${v.type.charAt(0).toUpperCase() + v.type.slice(1)}` as `variables.type${string}`, locale)} · {t(`variables.scope${v.scope.charAt(0).toUpperCase() + v.scope.slice(1)}` as `variables.scope${string}`, locale)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVariable(v.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <VariableEditor varId={v.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}