// ─── Code Layer Type Definitions ─────────────────────────────────────────────
// Code Layers allow embedding HTML/CSS/JS snippets as canvas elements with
// live preview rendering inside sandboxed iframes.

export type CodeLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'svg'
  | 'markdown';

export type CodeEditorTheme = 'dark' | 'light' | 'monokai' | 'dracula';

export type CodeTemplateCategory =
  | 'ui-component'
  | 'animation'
  | 'chart'
  | 'form'
  | 'layout'
  | 'art'
  | 'utility';

export interface CodeLayerData {
  /** HTML markup */
  html: string;
  /** CSS styles */
  css: string;
  /** JavaScript code */
  js: string;
  /** Primary language of the code */
  language: CodeLanguage;
  /** Whether to auto-run on change */
  autoRun: boolean;
  /** Show line numbers in editor */
  showLineNumbers: boolean;
  /** Editor font size in pixels */
  fontSize: number;
  /** Editor color theme */
  theme: CodeEditorTheme;
  /** Whether the iframe is sandboxed */
  sandboxed: boolean;
}

export type CodeEditorTab = 'html' | 'css' | 'js';

export interface CodeLayerElement {
  id: string;
  type: 'code-layer';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // JSON.stringify(CodeLayerData)
  color: string;
  zIndex: number;
  locked: boolean;
  visible?: boolean;
  name?: string;
  groupId?: string;
  parentId?: string;
  componentId?: string;
  componentOverrides?: Record<string, unknown>;
}

export interface CodeTemplate {
  /** Template display name */
  name: string;
  /** Short description */
  description: string;
  /** Category for filtering */
  category: CodeTemplateCategory;
  /** The code content */
  code: CodeLayerData;
  /** Default width when inserted */
  defaultWidth: number;
  /** Default height when inserted */
  defaultHeight: number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_CODE_LAYER_DATA: CodeLayerData = {
  html: '<div class="container">\n  <h1>Hello World</h1>\n  <p>Edit this code layer</p>\n</div>',
  css: '.container {\n  padding: 24px;\n  font-family: system-ui, sans-serif;\n  text-align: center;\n}\n\nh1 {\n  font-size: 24px;\n  color: #111827;\n  margin-bottom: 8px;\n}\n\np {\n  color: #6B7280;\n  font-size: 14px;\n}',
  js: '',
  language: 'html',
  autoRun: true,
  showLineNumbers: true,
  fontSize: 13,
  theme: 'dark',
  sandboxed: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Serialize CodeLayerData to JSON string for storage in element.content */
export function serializeCodeLayer(data: CodeLayerData): string {
  return JSON.stringify(data);
}

/** Parse JSON string from element.content back to CodeLayerData */
export function parseCodeLayer(content: string): CodeLayerData {
  try {
    const parsed = JSON.parse(content);
    return { ...DEFAULT_CODE_LAYER_DATA, ...parsed };
  } catch {
    return { ...DEFAULT_CODE_LAYER_DATA };
  }
}

/** Build a full HTML document from CodeLayerData for iframe srcdoc */
export function buildIframeSrcDoc(data: CodeLayerData): string {
  const { html, css, js, sandboxed } = data;

  if (sandboxed) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: auto; }
  ${css}
</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  ${css}
</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`;
}

/** Get theme-specific editor background color */
export function getEditorThemeBg(theme: CodeEditorTheme): string {
  switch (theme) {
    case 'dark':
      return '#1e1e2e';
    case 'light':
      return '#ffffff';
    case 'monokai':
      return '#272822';
    case 'dracula':
      return '#282a36';
  }
}

/** Get theme-specific editor text color */
export function getEditorThemeText(theme: CodeEditorTheme): string {
  switch (theme) {
    case 'dark':
      return '#cdd6f4';
    case 'light':
      return '#1e1e2e';
    case 'monokai':
      return '#f8f8f2';
    case 'dracula':
      return '#f8f8f2';
  }
}

/** Get theme-specific editor border color */
export function getEditorThemeBorder(theme: CodeEditorTheme): string {
  switch (theme) {
    case 'dark':
      return '#313244';
    case 'light':
      return '#e2e8f0';
    case 'monokai':
      return '#49483e';
    case 'dracula':
      return '#44475a';
  }
}

/** Get theme-specific line number color */
export function getEditorThemeLineNumber(theme: CodeEditorTheme): string {
  switch (theme) {
    case 'dark':
      return '#585b70';
    case 'light':
      return '#94a3b8';
    case 'monokai':
      return '#90908a';
    case 'dracula':
      return '#6272a4';
  }
}

/** Category display labels */
export const CODE_TEMPLATE_CATEGORY_LABELS: Record<CodeTemplateCategory, string> = {
  'ui-component': 'UI Components',
  'animation': 'Animation',
  'chart': 'Charts',
  'form': 'Forms',
  'layout': 'Layout',
  'art': 'Art',
  'utility': 'Utility',
};