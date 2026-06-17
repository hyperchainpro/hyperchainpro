// Design format registry for LayerBoard
// Covers all UI/UX design applications and their file formats as of 2026

export interface DesignFormat {
  extension: string;
  name: string;
  application: string;
  category: FormatCategory;
  importSupport: 'full' | 'partial' | 'image';
  exportSupport: 'full' | 'partial' | 'image';
  mimeType: string[];
  icon: string; // lucide icon name
  description: string;
}

export type FormatCategory =
  | 'professional-design'
  | 'prototyping'
  | 'diagramming'
  | 'presentation'
  | 'vector-image'
  | 'raster-image'
  | 'code-web'
  | '3d-motion'
  | 'data-config'
  | 'document';

export const FORMAT_CATEGORIES: { id: FormatCategory; label: string; icon: string }[] = [
  { id: 'professional-design', label: 'Professional Design', icon: 'Palette' },
  { id: 'prototyping', label: 'Prototyping & Interaction', icon: 'MousePointerClick' },
  { id: 'diagramming', label: 'Diagramming & Whiteboard', icon: 'GitBranch' },
  { id: 'presentation', label: 'Presentation', icon: 'Presentation' },
  { id: 'vector-image', label: 'Vector & Image', icon: 'Image' },
  { id: 'raster-image', label: 'Raster Image', icon: 'Camera' },
  { id: 'code-web', label: 'Code & Web', icon: 'Code' },
  { id: '3d-motion', label: '3D & Motion', icon: 'Box' },
  { id: 'data-config', label: 'Data & Config', icon: 'Database' },
  { id: 'document', label: 'Document', icon: 'FileText' },
];

export type ImportMethod = 'svg' | 'json' | 'image' | 'drawio' | 'excalidraw' | 'balsamiq' | 'html' | 'zip-based' | 'text';

export const ALL_DESIGN_FORMATS: DesignFormat[] = [
  // ──────────────────────────────────────────────
  // Professional Design Tools
  // ──────────────────────────────────────────────
  {
    extension: '.fig',
    name: 'Figma Design',
    application: 'Figma',
    category: 'professional-design',
    importSupport: 'full',
    exportSupport: 'partial',
    mimeType: ['application/x-figma', 'application/octet-stream'],
    icon: 'Figma',
    description: 'Figma native design file. Supports full import with layers, components, styles, and auto-layout. Exports as Figma-compatible JSON.',
  },
  {
    extension: '.figma',
    name: 'Figma Backup',
    application: 'Figma',
    category: 'professional-design',
    importSupport: 'full',
    exportSupport: 'partial',
    mimeType: ['application/x-figma-backup', 'application/octet-stream'],
    icon: 'Figma',
    description: 'Figma backup/offline file format. Full import with all design data preserved.',
  },
  {
    extension: '.sketch',
    name: 'Sketch Document',
    application: 'Sketch',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-sketch', 'application/octet-stream'],
    icon: 'PenTool',
    description: 'Sketch native format. Imports page structure, artboards, layers, and styles. Exports as Sketch-compatible JSON.',
  },
  {
    extension: '.xd',
    name: 'Adobe XD Document',
    application: 'Adobe XD',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/adobe.xd', 'application/octet-stream'],
    icon: 'Sparkles',
    description: 'Adobe XD design file. Imports layers, artboards, and basic interactions.',
  },
  {
    extension: '.psd',
    name: 'Adobe Photoshop Document',
    application: 'Adobe Photoshop',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'image',
    mimeType: ['image/vnd.adobe.photoshop'],
    icon: 'Layers',
    description: 'Adobe Photoshop design file. Imports layer structure and metadata. Exports as flattened image.',
  },
  {
    extension: '.psb',
    name: 'Photoshop Large Document',
    application: 'Adobe Photoshop',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'image',
    mimeType: ['image/vnd.adobe.photoshop.large'],
    icon: 'Layers',
    description: 'Adobe Photoshop large document format (beyond 30,000 pixels). Imports layer structure.',
  },
  {
    extension: '.ai',
    name: 'Adobe Illustrator File',
    application: 'Adobe Illustrator',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/postscript', 'application/illustrator'],
    icon: 'PenTool',
    description: 'Adobe Illustrator vector file. Imports artboards, paths, and text. Exports as SVG-compatible structure.',
  },
  {
    extension: '.indd',
    name: 'Adobe InDesign Document',
    application: 'Adobe InDesign',
    category: 'professional-design',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-indesign'],
    icon: 'BookOpen',
    description: 'Adobe InDesign layout file. Imports as rendered preview image.',
  },
  {
    extension: '.idml',
    name: 'InDesign Markup',
    application: 'Adobe InDesign',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/vnd.adobe.indesign-idml-package'],
    icon: 'BookOpen',
    description: 'Adobe InDesign Markup Language. Imports page structure, text frames, and linked assets.',
  },
  {
    extension: '.aep',
    name: 'After Effects Project',
    application: 'Adobe After Effects',
    category: 'professional-design',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-aftereffects'],
    icon: 'Film',
    description: 'Adobe After Effects motion graphics project. Imports as preview frame image.',
  },
  {
    extension: '.prproj',
    name: 'Premiere Pro Project',
    application: 'Adobe Premiere Pro',
    category: 'professional-design',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-premierepro'],
    icon: 'Film',
    description: 'Adobe Premiere Pro video editing project. Imports as thumbnail/preview image.',
  },
  {
    extension: '.afdesign',
    name: 'Affinity Designer File',
    application: 'Affinity Designer',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-affinity-designer'],
    icon: 'PenTool',
    description: 'Affinity Designer native file. Imports vector layers, artboards, and styles.',
  },
  {
    extension: '.afphoto',
    name: 'Affinity Photo File',
    application: 'Affinity Photo',
    category: 'professional-design',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-affinity-photo'],
    icon: 'Camera',
    description: 'Affinity Photo native file. Imports as rendered image with layer metadata.',
  },
  {
    extension: '.afpub',
    name: 'Affinity Publisher File',
    application: 'Affinity Publisher',
    category: 'professional-design',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-affinity-publisher'],
    icon: 'BookOpen',
    description: 'Affinity Publisher native file. Imports as rendered page preview.',
  },
  {
    extension: '.cdr',
    name: 'CorelDRAW File',
    application: 'CorelDRAW',
    category: 'professional-design',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-coreldraw', 'image/x-coreldraw'],
    icon: 'PenTool',
    description: 'CorelDRAW vector graphic file. Imports as rendered image.',
  },
  {
    extension: '.gvdesign',
    name: 'Gravit Designer File',
    application: 'Gravit Designer',
    category: 'professional-design',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-gravit-designer', 'application/json'],
    icon: 'PenTool',
    description: 'Gravit Designer (now Corel Vector) native file. Imports vector layers and styles.',
  },

  // ──────────────────────────────────────────────
  // Prototyping & Interaction
  // ──────────────────────────────────────────────
  {
    extension: '.framer',
    name: 'Framer Project',
    application: 'Framer',
    category: 'prototyping',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-framer', 'application/json'],
    icon: 'MousePointerClick',
    description: 'Framer design and prototyping file. Imports layout, components, and animation metadata.',
  },
  {
    extension: '.principle',
    name: 'Principle File',
    application: 'Principle',
    category: 'prototyping',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-principle'],
    icon: 'Play',
    description: 'Principle interaction design file. Imports as preview image.',
  },
  {
    extension: '.pie',
    name: 'ProtoPie File',
    application: 'ProtoPie',
    category: 'prototyping',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-protopie', 'application/json'],
    icon: 'MousePointerClick',
    description: 'ProtoPie interactive prototype. Imports layer structure and interaction triggers.',
  },
  {
    extension: '.inv',
    name: 'InVision Studio File',
    application: 'InVision',
    category: 'prototyping',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-invision-studio', 'application/json'],
    icon: 'Monitor',
    description: 'InVision Studio design file. Imports screens, components, and transition metadata.',
  },
  {
    extension: '.invd',
    name: 'InVision DSM Package',
    application: 'InVision',
    category: 'prototyping',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-invision-dsm', 'application/json'],
    icon: 'Package',
    description: 'InVision Design System Manager package. Imports design tokens and component specs.',
  },
  {
    extension: '.rp',
    name: 'Axure RP File',
    application: 'Axure',
    category: 'prototyping',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-axure-rp'],
    icon: 'Sitemap',
    description: 'Axure RP prototyping file. Imports pages, widgets, and interaction flows.',
  },
  {
    extension: '.jm',
    name: 'Justinmind File',
    application: 'Justinmind',
    category: 'prototyping',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-justinmind'],
    icon: 'Smartphone',
    description: 'Justinmind prototype file. Imports as rendered screen preview.',
  },
  {
    extension: '.mp',
    name: 'Mockplus File',
    application: 'Mockplus',
    category: 'prototyping',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-mockplus'],
    icon: 'Layout',
    description: 'Mockplus prototyping file. Imports as rendered preview image.',
  },
  {
    extension: '.penpot',
    name: 'Penpot File',
    application: 'Penpot',
    category: 'prototyping',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-penpot', 'application/json'],
    icon: 'PenTool',
    description: 'Penpot open-source design file. Imports layers, components, and layout data.',
  },

  // ──────────────────────────────────────────────
  // Diagramming & Whiteboard
  // ──────────────────────────────────────────────
  {
    extension: '.drawio',
    name: 'Draw.io Diagram',
    application: 'Draw.io (diagrams.net)',
    category: 'diagramming',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['application/x-drawio', 'text/xml'],
    icon: 'GitBranch',
    description: 'Draw.io (diagrams.net) diagram. Full import/export of shapes, connectors, and styling.',
  },
  {
    extension: '.dio',
    name: 'Draw.io Compressed Diagram',
    application: 'Draw.io (diagrams.net)',
    category: 'diagramming',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['application/x-drawio-compressed', 'application/octet-stream'],
    icon: 'GitBranch',
    description: 'Compressed Draw.io diagram. Same full support as .drawio format.',
  },
  {
    extension: '.vsdx',
    name: 'Visio Drawing',
    application: 'Microsoft Visio',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/vnd.ms-visio.drawing.main+xml'],
    icon: 'GitBranch',
    description: 'Microsoft Visio 2013+ drawing. Imports page structure, shapes, and connectors.',
  },
  {
    extension: '.vsd',
    name: 'Visio Legacy Drawing',
    application: 'Microsoft Visio',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/vnd.ms-visio'],
    icon: 'GitBranch',
    description: 'Microsoft Visio legacy binary drawing format. Imports basic shape data.',
  },
  {
    extension: '.graffle',
    name: 'OmniGraffle Document',
    application: 'OmniGraffle',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-omnigraffle'],
    icon: 'GitBranch',
    description: 'OmniGraffle diagram document. Imports canvas layers, shapes, and connections.',
  },
  {
    extension: '.bmpr',
    name: 'Balsamiq Project',
    application: 'Balsamiq',
    category: 'diagramming',
    importSupport: 'full',
    exportSupport: 'partial',
    mimeType: ['application/x-balsamiq', 'application/xml'],
    icon: 'Layout',
    description: 'Balsamiq wireframe project. Full import of wireframe controls, layout, and notes.',
  },
  {
    extension: '.pencil',
    name: 'Pencil Project File',
    application: 'Pencil Project',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-pencil-project', 'application/xml'],
    icon: 'Pencil',
    description: 'Pencil Project open-source wireframing tool file. Imports shapes and stencils.',
  },
  {
    extension: '.excalidraw',
    name: 'Excalidraw Drawing',
    application: 'Excalidraw',
    category: 'diagramming',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['application/x-excalidraw', 'application/json'],
    icon: 'Pencil',
    description: 'Excalidraw hand-drawn style diagram. Full import/export of elements, text, and styling.',
  },
  {
    extension: '.miro',
    name: 'Miro Board Export',
    application: 'Miro',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-miro', 'application/json'],
    icon: 'LayoutDashboard',
    description: 'Miro collaborative whiteboard export. Imports sticky notes, shapes, and connections.',
  },
  {
    extension: '.rtb',
    name: 'Miro Board Archive',
    application: 'Miro',
    category: 'diagramming',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-miro-board', 'application/octet-stream'],
    icon: 'LayoutDashboard',
    description: 'Miro board binary archive. Imports as rendered board preview image.',
  },
  {
    extension: '.figjam',
    name: 'FigJam Board',
    application: 'FigJam',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-figjam', 'application/octet-stream'],
    icon: 'StickyNote',
    description: 'FigJam collaborative whiteboard. Imports sticky notes, connectors, and stamps.',
  },
  {
    extension: '.whimsical',
    name: 'Whimsical Board',
    application: 'Whimsical',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-whimsical', 'application/json'],
    icon: 'Sparkles',
    description: 'Whimsical flowchart and wireframe board. Imports flowchart nodes and wireframe components.',
  },
  {
    extension: '.lucid',
    name: 'Lucidchart Diagram',
    application: 'Lucidchart',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-lucidchart', 'application/json'],
    icon: 'GitBranch',
    description: 'Lucidchart diagram export. Imports shapes, groups, and connection metadata.',
  },
  {
    extension: '.gliffy',
    name: 'Gliffy Diagram',
    application: 'Gliffy',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-gliffy', 'application/json'],
    icon: 'GitBranch',
    description: 'Gliffy diagram export. Imports shape hierarchy and connector data.',
  },
  {
    extension: '.canva',
    name: 'Canva Design',
    application: 'Canva',
    category: 'diagramming',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-canva', 'application/octet-stream'],
    icon: 'Palette',
    description: 'Canva design export. Imports page elements, text, and image placements.',
  },

  // ──────────────────────────────────────────────
  // Presentation
  // ──────────────────────────────────────────────
  {
    extension: '.pptx',
    name: 'PowerPoint Presentation',
    application: 'Microsoft PowerPoint',
    category: 'presentation',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    icon: 'Presentation',
    description: 'Microsoft PowerPoint 2007+ presentation. Imports slides, layouts, and text. Full export with themes and transitions.',
  },
  {
    extension: '.ppt',
    name: 'PowerPoint Legacy',
    application: 'Microsoft PowerPoint',
    category: 'presentation',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/vnd.ms-powerpoint'],
    icon: 'Presentation',
    description: 'Legacy PowerPoint binary format. Imports slide content and basic layout.',
  },
  {
    extension: '.key',
    name: 'Apple Keynote',
    application: 'Apple Keynote',
    category: 'presentation',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-iwork-keynote-sffkey'],
    icon: 'Presentation',
    description: 'Apple Keynote presentation. Imports as rendered slide images.',
  },
  {
    extension: '.gslides',
    name: 'Google Slides',
    application: 'Google Slides',
    category: 'presentation',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/vnd.google-apps.presentation'],
    icon: 'Presentation',
    description: 'Google Slides presentation. Imports as rendered slide images.',
  },
  {
    extension: '.odp',
    name: 'LibreOffice Impress',
    application: 'LibreOffice Impress',
    category: 'presentation',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/vnd.oasis.opendocument.presentation'],
    icon: 'Presentation',
    description: 'OpenDocument presentation format. Imports slides, shapes, and text content.',
  },
  {
    extension: '.pez',
    name: 'Prezi Presentation',
    application: 'Prezi',
    category: 'presentation',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-prezi'],
    icon: 'Presentation',
    description: 'Prezi presentation file. Imports as preview frame image.',
  },

  // ──────────────────────────────────────────────
  // Vector & Image
  // ──────────────────────────────────────────────
  {
    extension: '.svg',
    name: 'Scalable Vector Graphics',
    application: 'W3C Standard',
    category: 'vector-image',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['image/svg+xml'],
    icon: 'Image',
    description: 'SVG vector format. Full import/export of paths, shapes, text, gradients, and filters.',
  },
  {
    extension: '.svgz',
    name: 'Compressed SVG',
    application: 'W3C Standard',
    category: 'vector-image',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['image/svg+xml-compressed', 'application/gzip'],
    icon: 'Image',
    description: 'Gzip-compressed SVG. Same full support as .svg with smaller file size.',
  },
  {
    extension: '.eps',
    name: 'Encapsulated PostScript',
    application: 'Adobe',
    category: 'vector-image',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/postscript', 'image/x-eps'],
    icon: 'Image',
    description: 'Encapsulated PostScript vector format. Imports basic paths and text. Full SVG export.',
  },
  {
    extension: '.png',
    name: 'PNG Image',
    application: 'PNG Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/png'],
    icon: 'Camera',
    description: 'Portable Network Graphics. Imports as image element with transparency support. Full export.',
  },
  {
    extension: '.jpg',
    name: 'JPEG Image',
    application: 'JPEG Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/jpeg'],
    icon: 'Camera',
    description: 'JPEG compressed image. Imports as image element. Full export with quality control.',
  },
  {
    extension: '.jpeg',
    name: 'JPEG Image (alt extension)',
    application: 'JPEG Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/jpeg'],
    icon: 'Camera',
    description: 'JPEG image with .jpeg extension. Same format as .jpg.',
  },
  {
    extension: '.webp',
    name: 'WebP Image',
    application: 'Google',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/webp'],
    icon: 'Camera',
    description: 'WebP modern image format with lossy/lossless support. Imports as image element. Full export.',
  },
  {
    extension: '.gif',
    name: 'GIF Image',
    application: 'GIF Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/gif'],
    icon: 'Camera',
    description: 'Graphics Interchange Format. Imports as image element (first frame). Full export.',
  },
  {
    extension: '.bmp',
    name: 'BMP Image',
    application: 'BMP Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/bmp', 'image/x-bmp'],
    icon: 'Camera',
    description: 'Windows Bitmap image. Imports as image element. Full export.',
  },
  {
    extension: '.tiff',
    name: 'TIFF Image',
    application: 'TIFF Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/tiff'],
    icon: 'Camera',
    description: 'Tagged Image File Format. Imports as image element with multi-page support. Full export.',
  },
  {
    extension: '.tif',
    name: 'TIFF Image (alt extension)',
    application: 'TIFF Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/tiff'],
    icon: 'Camera',
    description: 'TIFF image with .tif extension. Same format as .tiff.',
  },
  {
    extension: '.ico',
    name: 'Icon File',
    application: 'ICO Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/x-icon', 'image/vnd.microsoft.icon'],
    icon: 'Star',
    description: 'Windows icon file with multiple sizes. Imports as image element.',
  },
  {
    extension: '.avif',
    name: 'AVIF Image',
    application: 'AOMedia',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/avif'],
    icon: 'Camera',
    description: 'AV1 Image File Format. Next-gen compression with excellent quality. Imports as image. Full export.',
  },
  {
    extension: '.heic',
    name: 'HEIC Image',
    application: 'Apple / MPEG',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/heic'],
    icon: 'Camera',
    description: 'High Efficiency Image Container. Apple and MPEG standard. Imports as image. Full export.',
  },
  {
    extension: '.heif',
    name: 'HEIF Image',
    application: 'MPEG',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'full',
    mimeType: ['image/heif'],
    icon: 'Camera',
    description: 'High Efficiency Image Format. MPEG standard container. Imports as image. Full export.',
  },
  {
    extension: '.tga',
    name: 'Targa Image',
    application: 'TGA Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/x-targa', 'image/tga'],
    icon: 'Camera',
    description: 'Truevision Targa raster format. Common in game textures. Imports as image element.',
  },
  {
    extension: '.hdr',
    name: 'HDR Image',
    application: 'HDR Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/vnd.radiance'],
    icon: 'Camera',
    description: 'High Dynamic Range image format. Imports as tone-mapped image element.',
  },
  {
    extension: '.pdf',
    name: 'PDF Document',
    application: 'Adobe',
    category: 'vector-image',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/pdf'],
    icon: 'FileText',
    description: 'Portable Document Format. Imports pages as vector/raster elements. Full PDF export.',
  },
  {
    extension: '.icns',
    name: 'macOS Icon',
    application: 'Apple',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/x-icns'],
    icon: 'Apple',
    description: 'macOS application icon bundle. Imports as image element.',
  },
  {
    extension: '.wbmp',
    name: 'Wireless Bitmap',
    application: 'WAP Standard',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/vnd.wap.wbmp'],
    icon: 'Smartphone',
    description: 'Wireless Bitmap for mobile devices. Monochrome format. Imports as image element.',
  },
  {
    extension: '.jxr',
    name: 'JPEG XR Image',
    application: 'Microsoft',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/jxr'],
    icon: 'Camera',
    description: 'JPEG XR (HD Photo) extended range format. Imports as image element.',
  },
  {
    extension: '.dds',
    name: 'DirectDraw Surface',
    application: 'Microsoft',
    category: 'raster-image',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['image/vnd-ms.dds', 'image/x-dds'],
    icon: 'Box',
    description: 'DirectDraw Surface texture format. Common in game development. Imports as image element.',
  },

  // ──────────────────────────────────────────────
  // Code & Web
  // ──────────────────────────────────────────────
  {
    extension: '.html',
    name: 'HTML Document',
    application: 'W3C Standard',
    category: 'code-web',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['text/html'],
    icon: 'Code',
    description: 'HTML web page. Full import as editable canvas with DOM structure. Full HTML export.',
  },
  {
    extension: '.htm',
    name: 'HTML Document (alt extension)',
    application: 'W3C Standard',
    category: 'code-web',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['text/html'],
    icon: 'Code',
    description: 'HTML document with .htm extension. Same format as .html.',
  },
  {
    extension: '.css',
    name: 'CSS Stylesheet',
    application: 'W3C Standard',
    category: 'code-web',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/css'],
    icon: 'Code',
    description: 'Cascading Style Sheets. Imports as style tokens and variables. Full CSS export.',
  },
  {
    extension: '.jsx',
    name: 'JSX Component',
    application: 'React',
    category: 'code-web',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/javascript', 'text/jsx'],
    icon: 'Code',
    description: 'React JSX component. Imports component structure and props. Full JSX export.',
  },
  {
    extension: '.tsx',
    name: 'TypeScript JSX Component',
    application: 'React',
    category: 'code-web',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/typescript', 'text/tsx'],
    icon: 'Code',
    description: 'React TypeScript component. Imports typed component structure. Full TSX export.',
  },
  {
    extension: '.vue',
    name: 'Vue Single File Component',
    application: 'Vue.js',
    category: 'code-web',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/x-vue'],
    icon: 'Code',
    description: 'Vue.js single file component. Imports template, script, and style sections.',
  },
  {
    extension: '.svelte',
    name: 'Svelte Component',
    application: 'Svelte',
    category: 'code-web',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/x-svelte'],
    icon: 'Code',
    description: 'Svelte component file. Imports markup, script, and style blocks.',
  },
  {
    extension: '.dart',
    name: 'Dart File',
    application: 'Flutter',
    category: 'code-web',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/dart', 'text/x-dart'],
    icon: 'Smartphone',
    description: 'Dart/Flutter UI code. Imports widget tree structure. Partial Dart export.',
  },

  // ──────────────────────────────────────────────
  // 3D & Motion
  // ──────────────────────────────────────────────
  {
    extension: '.blend',
    name: 'Blender Project',
    application: 'Blender',
    category: '3d-motion',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-blender'],
    icon: 'Box',
    description: 'Blender 3D project file. Imports as rendered preview image.',
  },
  {
    extension: '.c4d',
    name: 'Cinema 4D Project',
    application: 'Cinema 4D',
    category: '3d-motion',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-cinema4d'],
    icon: 'Box',
    description: 'Cinema 4D 3D project file. Imports as rendered preview image.',
  },
  {
    extension: '.riv',
    name: 'Rive Animation',
    application: 'Rive',
    category: '3d-motion',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['application/x-rive', 'application/octet-stream'],
    icon: 'Play',
    description: 'Rive interactive animation. Imports state machines, animations, and nested artboards.',
  },
  {
    extension: '.lottie',
    name: 'Lottie Animation',
    application: 'Lottie',
    category: '3d-motion',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/json+Lottie'],
    icon: 'Play',
    description: 'Lottie/Bodymovin animation JSON. Imports keyframes, shapes, and transforms. Full Lottie export.',
  },

  // ──────────────────────────────────────────────
  // Data & Config
  // ──────────────────────────────────────────────
  {
    extension: '.json',
    name: 'JSON File',
    application: 'JSON Standard',
    category: 'data-config',
    importSupport: 'full',
    exportSupport: 'full',
    mimeType: ['application/json'],
    icon: 'Braces',
    description: 'JavaScript Object Notation. Full import/export as structured data or design tokens.',
  },
  {
    extension: '.yaml',
    name: 'YAML File',
    application: 'YAML Standard',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/x-yaml', 'text/yaml'],
    icon: 'Braces',
    description: 'YAML data serialization. Imports as configuration or design token values. Full export.',
  },
  {
    extension: '.yml',
    name: 'YAML File (alt extension)',
    application: 'YAML Standard',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/x-yaml', 'text/yaml'],
    icon: 'Braces',
    description: 'YAML file with .yml extension. Same format as .yaml.',
  },
  {
    extension: '.xml',
    name: 'XML File',
    application: 'W3C Standard',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/xml', 'text/xml'],
    icon: 'Braces',
    description: 'Extensible Markup Language. Imports as structured data. Full XML export.',
  },
  {
    extension: '.csv',
    name: 'CSV File',
    application: 'CSV Standard',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/csv'],
    icon: 'Table',
    description: 'Comma-Separated Values. Imports as tabular data for data-driven design. Full export.',
  },
  {
    extension: '.md',
    name: 'Markdown File',
    application: 'Markdown Standard',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/markdown'],
    icon: 'FileText',
    description: 'Markdown document. Imports as text content with basic formatting. Full Markdown export.',
  },
  {
    extension: '.toml',
    name: 'TOML File',
    application: 'TOML Standard',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['application/toml', 'text/x-toml'],
    icon: 'Braces',
    description: "Tom's Obvious Minimal Language. Imports as configuration data. Full export.",
  },
  {
    extension: '.env',
    name: 'Environment File',
    application: 'dotenv',
    category: 'data-config',
    importSupport: 'partial',
    exportSupport: 'partial',
    mimeType: ['text/plain'],
    icon: 'Settings',
    description: 'Environment variable file. Imports as key-value configuration pairs.',
  },

  // ──────────────────────────────────────────────
  // Document
  // ──────────────────────────────────────────────
  {
    extension: '.docx',
    name: 'Word Document',
    application: 'Microsoft Word',
    category: 'document',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    icon: 'FileText',
    description: 'Microsoft Word 2007+ document. Imports as rendered page image.',
  },
  {
    extension: '.doc',
    name: 'Word Legacy Document',
    application: 'Microsoft Word',
    category: 'document',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/msword'],
    icon: 'FileText',
    description: 'Legacy Microsoft Word binary document. Imports as rendered page image.',
  },
  {
    extension: '.rtf',
    name: 'Rich Text Format',
    application: 'RTF Standard',
    category: 'document',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/rtf', 'text/rtf'],
    icon: 'FileText',
    description: 'Rich Text Format document. Imports as rendered content image.',
  },
  {
    extension: '.txt',
    name: 'Plain Text',
    application: 'Text Standard',
    category: 'document',
    importSupport: 'partial',
    exportSupport: 'full',
    mimeType: ['text/plain'],
    icon: 'FileText',
    description: 'Plain text file. Imports as text content. Full text export.',
  },
  {
    extension: '.pages',
    name: 'Apple Pages Document',
    application: 'Apple Pages',
    category: 'document',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-iwork-pages-sffpages'],
    icon: 'FileText',
    description: 'Apple Pages document. Imports as rendered page image.',
  },
  {
    extension: '.numbers',
    name: 'Apple Numbers Spreadsheet',
    application: 'Apple Numbers',
    category: 'document',
    importSupport: 'image',
    exportSupport: 'image',
    mimeType: ['application/x-iwork-numbers-sffnumbers'],
    icon: 'Table',
    description: 'Apple Numbers spreadsheet. Imports as rendered sheet image.',
  },
];

// ──────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────

/** Comma-separated string of all supported extensions for file input accept attribute */
export const ALL_EXTENSIONS: string = ALL_DESIGN_FORMATS.map(f => f.extension).join(',');

/** Comma-separated string of all importable extensions */
export const IMPORTABLE_EXTENSIONS: string = ALL_DESIGN_FORMATS
  .filter(f => f.importSupport !== 'none' as never)
  .map(f => f.extension)
  .join(',');

/** Array of all formats that support export */
export const EXPORTABLE_FORMATS: DesignFormat[] = ALL_DESIGN_FORMATS
  .filter(f => f.exportSupport !== 'none' as never);

/** Lookup a format by its file extension (case-insensitive) */
export function getFormatByExtension(ext: string): DesignFormat | undefined {
  const normalized = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  return ALL_DESIGN_FORMATS.find(f => f.extension.toLowerCase() === normalized);
}

/** Get all formats in a specific category */
export function getFormatsByCategory(category: FormatCategory): DesignFormat[] {
  return ALL_DESIGN_FORMATS.filter(f => f.category === category);
}

/**
 * Determine the import method/pipeline for a given file extension.
 * Returns the most specific parser to use for the file.
 */
export function getImportMethod(ext: string): ImportMethod {
  const normalized = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;

  // SVG-based formats
  if (['.svg', '.svgz', '.eps'].includes(normalized)) {
    return 'svg';
  }

  // Draw.io (specific parser for mxGraph XML)
  if (['.drawio', '.dio'].includes(normalized)) {
    return 'drawio';
  }

  // Excalidraw (specific parser for Excalidraw JSON schema)
  if (normalized === '.excalidraw') {
    return 'excalidraw';
  }

  // Balsamiq (specific parser for Balsamiq XML)
  if (normalized === '.bmpr') {
    return 'balsamiq';
  }

  // HTML (specific DOM parser)
  if (['.html', '.htm'].includes(normalized)) {
    return 'html';
  }

  // Zip-based packages (contain embedded XML/JSON resources)
  if (
    [
      '.sketch', '.pptx', '.key', '.odp', '.vsdx', '.graffle',
      '.idml', '.canva', '.figjam', '.figma',
    ].includes(normalized)
  ) {
    return 'zip-based';
  }

  // Text-based formats
  if (
    [
      '.txt', '.md', '.css', '.csv', '.yaml', '.yml', '.xml',
      '.toml', '.env', '.jsx', '.tsx', '.vue', '.svelte', '.dart',
      '.ppt', '.doc', '.docx', '.rtf', '.pages', '.numbers', '.indd', '.mp',
    ].includes(normalized)
  ) {
    return 'text';
  }

  // JSON-based formats (design tool JSON exports)
  if (
    [
      '.json', '.fig', '.xd', '.framer', '.penpot', '.lottie',
      '.whimsical', '.miro', '.lucid', '.gliffy',
      '.inv', '.invd', '.rp', '.pie', '.afdesign', '.gvdesign',
      '.pencil', '.vsd', '.riv',
    ].includes(normalized)
  ) {
    return 'json';
  }

  // Default: image import (raster fallback)
  return 'image';
}