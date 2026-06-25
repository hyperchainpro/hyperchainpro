import { create } from 'zustand';

interface GenerativeState {
  isGenerating: boolean;
  patternType: string;
  style: string;
  color1: string;
  color2: string;
  color3: string;
  density: number;
  generatedSvg: string | null;
  generatedElements: GeneratedElement[] | null;
  error: string | null;

  setPatternType: (type: string) => void;
  setStyle: (style: string) => void;
  setColor1: (color: string) => void;
  setColor2: (color: string) => void;
  setColor3: (color: string) => void;
  setDensity: (density: number) => void;
  setIsGenerating: (v: boolean) => void;
  setGeneratedSvg: (svg: string | null) => void;
  setGeneratedElements: (elements: GeneratedElement[] | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface GeneratedElement {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  rotation?: number;
  opacity?: number;
}

const initialState = {
  isGenerating: false,
  patternType: 'geometric',
  style: 'minimal',
  color1: '#10b981',
  color2: '#f59e0b',
  color3: '#ec4899',
  density: 8,
  generatedSvg: null,
  generatedElements: null,
  error: null,
};

export const useGenerativeStore = create<GenerativeState>((set) => ({
  ...initialState,

  setPatternType: (type) => set({ patternType: type }),
  setStyle: (style) => set({ style }),
  setColor1: (color) => set({ color1: color }),
  setColor2: (color) => set({ color2: color }),
  setColor3: (color) => set({ color3: color }),
  setDensity: (density) => set({ density }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setGeneratedSvg: (svg) => set({ generatedSvg: svg }),
  setGeneratedElements: (elements) => set({ generatedElements: elements }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));