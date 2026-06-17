import {
  Rocket, Square, Palette, Layers, Play, GitBranch, Users,
  Puzzle, Sparkles, Download, Plug, Code, Variable, Keyboard,
} from 'lucide-react';

export interface GuideSubsection { id: string }
export interface GuideSection { id: string; icon: string; subsections: GuideSubsection[] }

export const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'gettingStarted', icon: 'Rocket', subsections: [{ id: 'whatIs' }, { id: 'account' }, { id: 'dashboard' }, { id: 'firstBoard' }] },
  { id: 'canvas', icon: 'Square', subsections: [{ id: 'elementTypes' }, { id: 'drawing' }, { id: 'selection' }, { id: 'resizeRotate' }, { id: 'text' }, { id: 'connectors' }, { id: 'pen' }, { id: 'frames' }] },
  { id: 'design', icon: 'Palette', subsections: [{ id: 'overview' }, { id: 'fills' }, { id: 'strokes' }, { id: 'shadows' }, { id: 'typography' }, { id: 'autoLayout' }, { id: 'cornerRadius' }] },
  { id: 'layersAssets', icon: 'Layers', subsections: [{ id: 'layersPanel' }, { id: 'ordering' }, { id: 'components' }, { id: 'stylePresets' }] },
  { id: 'prototyping', icon: 'Play', subsections: [{ id: 'interactions' }, { id: 'transitions' }, { id: 'overlays' }, { id: 'preview' }] },
  { id: 'versionControl', icon: 'GitBranch', subsections: [{ id: 'branches' }, { id: 'commits' }, { id: 'mergeRequests' }, { id: 'conflicts' }, { id: 'history' }] },
  { id: 'collaboration', icon: 'Users', subsections: [{ id: 'invites' }, { id: 'presence' }, { id: 'roles' }] },
  { id: 'plugins', icon: 'Puzzle', subsections: [{ id: 'marketplace' }, { id: 'manage' }, { id: 'categories' }] },
  { id: 'aiDesign', icon: 'Sparkles', subsections: [{ id: 'generation' }, { id: 'agents' }, { id: 'commitMessages' }] },
  { id: 'importExport', icon: 'Download', subsections: [{ id: 'importing' }, { id: 'exportFormats' }, { id: 'batch' }] },
  { id: 'integrations', icon: 'Plug', subsections: [{ id: 'mcp' }, { id: 'webhooks' }, { id: 'services' }, { id: 'restApi' }] },
  { id: 'devMode', icon: 'Code', subsections: [{ id: 'specs' }, { id: 'codeOutput' }] },
  { id: 'variables', icon: 'Variable', subsections: [{ id: 'creating' }, { id: 'applying' }] },
  { id: 'shortcuts', icon: 'Keyboard', subsections: [] },
];

export const ICON_MAP: Record<string, React.ElementType> = {
  Rocket, Square, Palette, Layers, Play, GitBranch, Users, Puzzle,
  Sparkles, Download, Plug, Code, Variable, Keyboard,
};