import { create } from 'zustand';

export interface DesignVariable {
  id: string;
  name: string;
  type: 'color' | 'number' | 'string' | 'boolean';
  value: string | number | boolean;
  scope: 'board' | 'global';
  description?: string;
}

interface VariablesStore {
  variables: DesignVariable[];
  addVariable: (v: Omit<DesignVariable, 'id'>) => void;
  updateVariable: (id: string, data: Partial<DesignVariable>) => void;
  deleteVariable: (id: string) => void;
}

export const useVariablesStore = create<VariablesStore>((set) => ({
  variables: [],
  addVariable: (v) =>
    set((s) => ({ variables: [...s.variables, { ...v, id: `var-${Date.now()}` }] })),
  updateVariable: (id, data) =>
    set((s) => ({ variables: s.variables.map((v) => (v.id === id ? { ...v, ...data } : v)) })),
  deleteVariable: (id) =>
    set((s) => ({ variables: s.variables.filter((v) => v.id !== id) })),
}));
