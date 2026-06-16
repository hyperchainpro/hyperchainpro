// Script to generate 475 additional plugins and append to plugins-data.ts
// Run with: bun run scripts/generate-plugins.ts

import { readFileSync, writeFileSync } from 'fs';

// Parse existing plugin IDs
const existingContent = readFileSync('/home/z/my-project/src/lib/plugins-data.ts', 'utf-8');
const idRegex = /id:\s*'([^']+)'/g;
const existingIds = new Set<string>();
let match;
while ((match = idRegex.exec(existingContent)) !== null) {
  existingIds.add(match[1]);
}
console.log(`Existing plugins: ${existingIds.size}`);

// New categories
const newCategories = [
  'data-viz', 'ui-kits', 'social-media', 'e-commerce', 'presentation',
  'forms', 'navigation', 'cards', 'tables', 'modals',
  'video', 'audio', 'kanban', 'dashboard-widgets', 'maps'
];

// All category labels
const categoryLabels: Record<string, string> = {
  'shapes': 'Shapes', 'charts': 'Charts', 'icons': 'Icons', 'layout': 'Layout',
  'wireframe': 'Wireframe', 'diagrams': 'Diagrams', 'text': 'Text', 'images': 'Images',
  'colors': 'Colors', 'export': 'Export', 'templates': 'Templates', 'ai-tools': 'AI Tools',
  'collaboration': 'Collaboration', 'accessibility': 'Accessibility', 'math': 'Math',
  'typography': 'Typography', 'branding': 'Branding', 'animation': 'Animation',
  'prototyping': 'Prototyping', '3d': '3D', 'illustration': 'Illustration',
  'photo-editing': 'Photo Editing', 'responsive': 'Responsive', 'code-gen': 'Code Gen',
  'handoff': 'Handoff', 'data-viz': 'Data Viz', 'ui-kits': 'UI Kits',
  'social-media': 'Social Media', 'e-commerce': 'E-Commerce', 'presentation': 'Presentation',
  'forms': 'Forms', 'navigation': 'Navigation', 'cards': 'Cards', 'tables': 'Tables',
  'modals': 'Modals', 'video': 'Video', 'audio': 'Audio', 'kanban': 'Kanban',
  'dashboard-widgets': 'Dashboard Widgets', 'maps': 'Maps'
};

// Plugin definitions
const plugins: { id: string; name: string; desc: string; cat: string; icon: string; tags: string[]; author: string; popular?: boolean }[] = [
  // ── Data Viz (20) ──
  { id: 'data-viz-heatmap', name: 'Heatmap Generator', desc: 'Create color-coded heatmap visualizations for data density representation.', cat: 'data-viz', icon: 'Grid3x3', tags: ['heatmap', 'density', 'color', 'matrix', 'data'], author: 'VizLab' },
  { id: 'data-viz-treemap', name: 'Treemap Chart', desc: 'Hierarchical data visualization using nested rectangles with proportional sizing.', cat: 'data-viz', icon: 'LayoutGrid', tags: ['treemap', 'hierarchy', 'nested', 'proportional'], author: 'VizLab' },
  { id: 'data-viz-sankey', name: 'Sankey Diagram', desc: 'Flow diagram showing quantities through pathways and connections.', cat: 'data-viz', icon: 'GitBranch', tags: ['sankey', 'flow', 'energy', 'pathway', 'stream'], author: 'FlowViz' },
  { id: 'data-viz-bubble', name: 'Bubble Chart', desc: 'Three-dimensional data visualization using sized and colored circles.', cat: 'data-viz', icon: 'Circle', tags: ['bubble', 'scatter', 'size', 'three-dimension'], author: 'VizLab' },
  { id: 'data-viz-radar', name: 'Radar/Spider Chart', desc: 'Multi-axis chart showing multiple quantitative variables from a center point.', cat: 'data-viz', icon: 'Hexagon', tags: ['radar', 'spider', 'multi-axis', 'comparison'], author: 'ChartWorks' },
  { id: 'data-viz-funnel', name: 'Funnel Chart', desc: 'Progressive stages visualization showing conversion rates and drop-offs.', cat: 'data-viz', icon: 'Filter', tags: ['funnel', 'conversion', 'stages', 'pipeline'], author: 'FunnelPro' },
  { id: 'data-viz-gauge', name: 'Gauge/Speedometer', desc: 'Semi-circular gauge for KPIs, metrics, and performance indicators.', cat: 'data-viz', icon: 'Gauge', tags: ['gauge', 'speedometer', 'kpi', 'metric', 'dial'], author: 'MetricsUI', popular: true },
  { id: 'data-viz-waterfall', name: 'Waterfall Chart', desc: 'Sequential positive and negative values showing cumulative effect.', cat: 'data-viz', icon: 'BarChart3', tags: ['waterfall', 'cumulative', 'sequential', 'financial'], author: 'FinViz' },
  { id: 'data-viz-scatter', name: 'Scatter Plot', desc: 'Two-variable data points showing correlation and distribution patterns.', cat: 'data-viz', icon: 'Target', tags: ['scatter', 'correlation', 'distribution', 'points'], author: 'DataLab' },
  { id: 'data-viz-area', name: 'Area Chart', desc: 'Filled line chart showing volume and trends over continuous data.', cat: 'data-viz', icon: 'Activity', tags: ['area', 'filled', 'volume', 'trend'], author: 'ChartWorks' },
  { id: 'data-viz-venn', name: 'Venn Diagram', desc: 'Overlapping circles showing logical relationships between sets.', cat: 'data-viz', icon: 'Circle', tags: ['venn', 'sets', 'overlap', 'logic', 'intersection'], author: 'LogicViz' },
  { id: 'data-viz-histogram', name: 'Histogram', desc: 'Frequency distribution of continuous data divided into bins.', cat: 'data-viz', icon: 'BarChart3', tags: ['histogram', 'frequency', 'distribution', 'bins'], author: 'StatsViz' },
  { id: 'data-viz-box-plot', name: 'Box Plot', desc: 'Statistical distribution showing quartiles, median, and outliers.', cat: 'data-viz', icon: 'Box', tags: ['boxplot', 'statistics', 'quartiles', 'median', 'outliers'], author: 'StatsViz' },
  { id: 'data-viz-progress-ring', name: 'Progress Ring', desc: 'Circular progress indicator for dashboards and status displays.', cat: 'data-viz', icon: 'RefreshCw', tags: ['progress', 'ring', 'circular', 'indicator', 'percent'], author: 'MetricsUI' },
  { id: 'data-viz-sparkline', name: 'Sparkline', desc: 'Minimal inline charts for embedding in tables and cards.', cat: 'data-viz', icon: 'TrendingUp', tags: ['sparkline', 'inline', 'mini', 'compact', 'trend'], author: 'DataLab' },
  { id: 'data-viz-polar', name: 'Polar Area Chart', desc: 'Circular chart with varying sector radii for magnitude comparison.', cat: 'data-viz', icon: 'PieChart', tags: ['polar', 'circular', 'magnitude', 'sector'], author: 'VizLab' },
  { id: 'data-viz-timeline-chart', name: 'Timeline Chart', desc: 'Horizontal timeline visualization for project milestones and events.', cat: 'data-viz', icon: 'Clock', tags: ['timeline', 'milestone', 'gantt', 'schedule', 'project'], author: 'ProjectViz' },
  { id: 'data-viz-network-graph', name: 'Network Graph', desc: 'Node-link diagram showing relationships and connections in data.', cat: 'data-viz', icon: 'Share2', tags: ['network', 'graph', 'nodes', 'links', 'relationships'], author: 'GraphLab' },
  { id: 'data-viz-dendrogram', name: 'Dendrogram', desc: 'Tree diagram showing hierarchical clustering of data points.', cat: 'data-viz', icon: 'GitMerge', tags: ['dendrogram', 'clustering', 'hierarchy', 'tree'], author: 'DataLab' },
  { id: 'data-viz-chord', name: 'Chord Diagram', desc: 'Circular layout showing relationships between entities with arcs.', cat: 'data-viz', icon: 'Circle', tags: ['chord', 'circular', 'relationships', 'arcs', 'flows'], author: 'VizLab' },

  // ── UI Kits (30) ──
  { id: 'ui-kits-button-kit', name: 'Button Kit', desc: 'Comprehensive button variants: primary, secondary, ghost, icon, loading states.', cat: 'ui-kits', icon: 'MousePointer', tags: ['button', 'cta', 'action', 'interactive', 'state'], author: 'UIFoundry', popular: true },
  { id: 'ui-kits-input-kit', name: 'Input Kit', desc: 'Text inputs, textareas, search fields with validation and error states.', cat: 'ui-kits', icon: 'Type', tags: ['input', 'text', 'field', 'form', 'validation'], author: 'UIFoundry' },
  { id: 'ui-kits-card-kit', name: 'Card Kit', desc: 'Content cards, profile cards, product cards, stats cards, media cards.', cat: 'ui-kits', icon: 'Layout', tags: ['card', 'content', 'profile', 'product', 'media'], author: 'UIFoundry' },
  { id: 'ui-kits-modal-kit', name: 'Modal Kit', desc: 'Dialog modals, confirmation dialogs, sheet panels, popovers.', cat: 'ui-kits', icon: 'Maximize', tags: ['modal', 'dialog', 'confirmation', 'sheet', 'overlay'], author: 'UIFoundry' },
  { id: 'ui-kits-nav-kit', name: 'Navigation Kit', desc: 'Top nav, sidebar, breadcrumbs, tabs, pill navigation, bottom nav.', cat: 'ui-kits', icon: 'Navigation', tags: ['navigation', 'nav', 'sidebar', 'breadcrumb', 'tab'], author: 'UIFoundry' },
  { id: 'ui-kits-table-kit', name: 'Table Kit', desc: 'Data tables with sorting, pagination, selection, and action columns.', cat: 'ui-kits', icon: 'Rows', tags: ['table', 'data', 'sort', 'pagination', 'grid'], author: 'UIFoundry' },
  { id: 'ui-kits-dropdown-kit', name: 'Dropdown Kit', desc: 'Dropdown menus, select boxes, multi-select, autocomplete, combobox.', cat: 'ui-kits', icon: 'ChevronDown', tags: ['dropdown', 'select', 'menu', 'autocomplete', 'combobox'], author: 'UIFoundry' },
  { id: 'ui-kits-toast-kit', name: 'Toast Kit', desc: 'Notification toasts, snackbars, alerts, banners, and inline messages.', cat: 'ui-kits', icon: 'Bell', tags: ['toast', 'notification', 'alert', 'snackbar', 'message'], author: 'UIFoundry' },
  { id: 'ui-kits-avatar-kit', name: 'Avatar Kit', desc: 'User avatars, avatar groups, status indicators, and fallback initials.', cat: 'ui-kits', icon: 'User', tags: ['avatar', 'user', 'profile', 'group', 'status'], author: 'UIFoundry' },
  { id: 'ui-kits-badge-kit', name: 'Badge Kit', desc: 'Status badges, count badges, tags, chips, and labels.', cat: 'ui-kits', icon: 'Star', tags: ['badge', 'tag', 'chip', 'label', 'status'], author: 'UIFoundry' },
  { id: 'ui-kits-toggle-kit', name: 'Toggle Kit', desc: 'Switches, checkboxes, radio buttons, and toggle button groups.', cat: 'ui-kits', icon: 'ToggleLeft', tags: ['toggle', 'switch', 'checkbox', 'radio', 'control'], author: 'UIFoundry' },
  { id: 'ui-kits-progress-kit', name: 'Progress Kit', desc: 'Progress bars, spinners, skeleton loaders, and step indicators.', cat: 'ui-kits', icon: 'Activity', tags: ['progress', 'loading', 'skeleton', 'spinner', 'step'], author: 'UIFoundry' },
  { id: 'ui-kits-hero-section', name: 'Hero Section Kit', desc: 'Landing page hero sections with CTAs, backgrounds, and content layouts.', cat: 'ui-kits', icon: 'Layout', tags: ['hero', 'landing', 'section', 'banner', 'cta'], author: 'LandingKit' },
  { id: 'ui-kits-pricing-table', name: 'Pricing Table Kit', desc: 'Pricing tiers, feature comparison tables, and plan selector cards.', cat: 'ui-kits', icon: 'DollarSign', tags: ['pricing', 'plan', 'tier', 'comparison', 'saas'], author: 'SaaSKit' },
  { id: 'ui-kits-testimonial-kit', name: 'Testimonial Kit', desc: 'Customer testimonials, review cards, and rating displays.', cat: 'ui-kits', icon: 'MessageSquare', tags: ['testimonial', 'review', 'rating', 'customer', 'feedback'], author: 'LandingKit' },
  { id: 'ui-kits-footer-kit', name: 'Footer Kit', desc: 'Multi-column footers, simple footers, and mega footers.', cat: 'ui-kits', icon: 'PanelBottom', tags: ['footer', 'links', 'sitemap', 'bottom'], author: 'UIFoundry' },
  { id: 'ui-kits-header-kit', name: 'Header Kit', desc: 'App headers, marketing headers, and mega menu navigation bars.', cat: 'ui-kits', icon: 'PanelTop', tags: ['header', 'app-bar', 'toolbar', 'top-bar'], author: 'UIFoundry' },
  { id: 'ui-kits-sidebar-kit', name: 'Sidebar Kit', desc: 'App sidebars, collapsible panels, and multi-level navigation.', cat: 'ui-kits', icon: 'Sidebar', tags: ['sidebar', 'panel', 'collapsible', 'navigation'], author: 'UIFoundry' },
  { id: 'ui-kits-empty-state', name: 'Empty State Kit', desc: 'Empty state illustrations, messages, and CTAs for zero-data views.', cat: 'ui-kits', icon: 'Inbox', tags: ['empty', 'state', 'placeholder', 'zero-data'], author: 'UIFoundry' },
  { id: 'ui-kits-error-state', name: 'Error State Kit', desc: 'Error pages, error messages, and recovery actions for failures.', cat: 'ui-kits', icon: 'AlertTriangle', tags: ['error', 'failure', 'recovery', 'exception'], author: 'UIFoundry' },
  { id: 'ui-kits-onboarding', name: 'Onboarding Flow Kit', desc: 'Step-by-step onboarding wizards, tooltips, and tour guides.', cat: 'ui-kits', icon: 'GraduationCap', tags: ['onboarding', 'wizard', 'tour', 'tooltip', 'guide'], author: 'UXKit' },
  { id: 'ui-kits-search-kit', name: 'Search Kit', desc: 'Search bars, filters, result lists, and advanced search UIs.', cat: 'ui-kits', icon: 'Search', tags: ['search', 'filter', 'results', 'query', 'find'], author: 'UIFoundry' },
  { id: 'ui-kits-chat-bubble', name: 'Chat Bubble Kit', desc: 'Message bubbles, chat lists, input areas, and conversation UI.', cat: 'ui-kits', icon: 'MessageSquare', tags: ['chat', 'message', 'conversation', 'bubble'], author: 'UIFoundry' },
  { id: 'ui-kits-stat-card', name: 'Stat Card Kit', desc: 'Metric cards, KPI displays, and data summary widgets.', cat: 'ui-kits', icon: 'TrendingUp', tags: ['stat', 'metric', 'kpi', 'number', 'summary'], author: 'DashboardKit' },
  { id: 'ui-kits-timeline-kit', name: 'Timeline Kit', desc: 'Vertical and horizontal timelines for activity feeds and history.', cat: 'ui-kits', icon: 'History', tags: ['timeline', 'activity', 'feed', 'history', 'chronological'], author: 'UIFoundry' },
  { id: 'ui-kits-accordion-kit', name: 'Accordion Kit', desc: 'Collapsible sections, FAQs, expandable panels, and disclosure widgets.', cat: 'ui-kits', icon: 'ChevronDown', tags: ['accordion', 'collapse', 'expand', 'faq', 'disclosure'], author: 'UIFoundry' },
  { id: 'ui-kits-stepper-kit', name: 'Stepper Kit', desc: 'Step indicators, progress steps, and multi-step form navigation.', cat: 'ui-kits', icon: 'ListTodo', tags: ['stepper', 'steps', 'progress', 'wizard', 'multi-step'], author: 'UXKit' },
  { id: 'ui-kits-tooltip-kit', name: 'Tooltip Kit', desc: 'Tooltips, popovers, and contextual help overlays.', cat: 'ui-kits', icon: 'MessageCircle', tags: ['tooltip', 'popover', 'help', 'overlay', 'hint'], author: 'UIFoundry' },
  { id: 'ui-kits-file-uploader', name: 'File Uploader Kit', desc: 'Drag-and-drop upload zones, file lists, and progress indicators.', cat: 'ui-kits', icon: 'Upload', tags: ['upload', 'drag-drop', 'file', 'attach'], author: 'UIFoundry' },
  { id: 'ui-kits-skeleton-kit', name: 'Skeleton Loader Kit', desc: 'Content placeholder skeletons for images, text, cards, and tables.', cat: 'ui-kits', icon: 'Layers', tags: ['skeleton', 'placeholder', 'loading', 'shimmer'], author: 'UIFoundry' },

  // ── Social Media (12) ──
  { id: 'social-instagram-post', name: 'Instagram Post', desc: 'Square 1080x1080 post templates with various layouts and styles.', cat: 'social-media', icon: 'Camera', tags: ['instagram', 'post', 'square', 'social', 'photo'], author: 'SocialKit', popular: true },
  { id: 'social-instagram-story', name: 'Instagram Story', desc: 'Vertical 1080x1920 story templates with interactive elements.', cat: 'social-media', icon: 'Smartphone', tags: ['instagram', 'story', 'vertical', 'full-screen'], author: 'SocialKit' },
  { id: 'social-facebook-cover', name: 'Facebook Cover', desc: 'Facebook page cover photo templates at 820x312 pixels.', cat: 'social-media', icon: 'Layout', tags: ['facebook', 'cover', 'banner', 'page'], author: 'SocialKit' },
  { id: 'social-twitter-header', name: 'X/Twitter Header', desc: 'Profile header banner templates at 1500x500 pixels.', cat: 'social-media', icon: 'Layout', tags: ['twitter', 'x', 'header', 'banner', 'profile'], author: 'SocialKit' },
  { id: 'social-youtube-thumbnail', name: 'YouTube Thumbnail', desc: 'Video thumbnail templates at 1280x720 optimized for clicks.', cat: 'social-media', icon: 'Video', tags: ['youtube', 'thumbnail', 'video', 'cover'], author: 'SocialKit' },
  { id: 'social-linkedin-post', name: 'LinkedIn Post', desc: 'Professional post templates for LinkedIn articles and updates.', cat: 'social-media', icon: 'Briefcase', tags: ['linkedin', 'professional', 'post', 'article'], author: 'SocialKit' },
  { id: 'social-pinterest-pin', name: 'Pinterest Pin', desc: 'Vertical pin templates at 1000x1500 for maximum visibility.', cat: 'social-media', icon: 'LayoutGrid', tags: ['pinterest', 'pin', 'vertical', 'visual'], author: 'SocialKit' },
  { id: 'social-tiktok-cover', name: 'TikTok Cover', desc: 'TikTok video cover templates at 1080x1920.', cat: 'social-media', icon: 'Music', tags: ['tiktok', 'cover', 'video', 'short-form'], author: 'SocialKit' },
  { id: 'social-social-proof', name: 'Social Proof Widget', desc: 'Testimonial carousels, review counts, and trust badges.', cat: 'social-media', icon: 'Star', tags: ['social-proof', 'testimonial', 'trust', 'reviews'], author: 'SocialKit' },
  { id: 'social-story-highlight', name: 'Story Highlight Cover', desc: 'Instagram story highlight icon templates at 150x150.', cat: 'social-media', icon: 'Circle', tags: ['instagram', 'highlight', 'icon', 'circle'], author: 'SocialKit' },
  { id: 'social-og-image', name: 'OG Image Generator', desc: 'Open Graph meta image templates for social media sharing.', cat: 'social-media', icon: 'Globe', tags: ['og-image', 'meta', 'sharing', 'preview'], author: 'SocialKit' },
  { id: 'social-carousel-template', name: 'Carousel Template', desc: 'Multi-slide carousel post templates for any platform.', cat: 'social-media', icon: 'Layers', tags: ['carousel', 'slides', 'swipe', 'multi-page'], author: 'SocialKit' },

  // ── E-Commerce (12) ──
  { id: 'ecommerce-product-card', name: 'Product Card', desc: 'Product display cards with image, price, rating, and add-to-cart.', cat: 'e-commerce', icon: 'ShoppingCart', tags: ['product', 'card', 'price', 'rating', 'store'], author: 'CommerceKit', popular: true },
  { id: 'ecommerce-product-gallery', name: 'Product Gallery', desc: 'Multi-image product gallery with thumbnails and zoom.', cat: 'e-commerce', icon: 'Images', tags: ['gallery', 'images', 'zoom', 'product', 'browse'], author: 'CommerceKit' },
  { id: 'ecommerce-checkout-flow', name: 'Checkout Flow', desc: 'Multi-step checkout form with cart summary and payment.', cat: 'e-commerce', icon: 'CreditCard', tags: ['checkout', 'payment', 'cart', 'form', 'flow'], author: 'CommerceKit' },
  { id: 'ecommerce-cart-page', name: 'Shopping Cart', desc: 'Full cart page with quantity controls, coupons, and totals.', cat: 'e-commerce', icon: 'ShoppingCart', tags: ['cart', 'quantity', 'coupon', 'total'], author: 'CommerceKit' },
  { id: 'ecommerce-category-grid', name: 'Category Grid', desc: 'Product category grid with images, names, and item counts.', cat: 'e-commerce', icon: 'LayoutGrid', tags: ['category', 'grid', 'browse', 'navigation'], author: 'CommerceKit' },
  { id: 'ecommerce-review-widget', name: 'Review Widget', desc: 'Product review display with star ratings and photos.', cat: 'e-commerce', icon: 'Star', tags: ['review', 'rating', 'star', 'feedback'], author: 'CommerceKit' },
  { id: 'ecommerce-price-tag', name: 'Price Tag', desc: 'Styled price tags with original price, discount, and badges.', cat: 'e-commerce', icon: 'Tag', tags: ['price', 'discount', 'sale', 'badge'], author: 'CommerceKit' },
  { id: 'ecommerce-quick-view', name: 'Quick View Modal', desc: 'Product quick view overlay with key details and actions.', cat: 'e-commerce', icon: 'Eye', tags: ['quick-view', 'modal', 'overlay', 'preview'], author: 'CommerceKit' },
  { id: 'ecommerce-order-confirmation', name: 'Order Confirmation', desc: 'Post-purchase confirmation page with order details and tracking.', cat: 'e-commerce', icon: 'Check', tags: ['confirmation', 'order', 'tracking', 'success'], author: 'CommerceKit' },
  { id: 'ecommerce-wishlist', name: 'Wishlist Component', desc: 'Save-for-later wishlist with heart toggle and management.', cat: 'e-commerce', icon: 'Heart', tags: ['wishlist', 'favorite', 'save', 'heart'], author: 'CommerceKit' },
  { id: 'ecommerce-filter-sidebar', name: 'Filter Sidebar', desc: 'Product filter panel with price range, colors, sizes, and categories.', cat: 'e-commerce', icon: 'Filter', tags: ['filter', 'sidebar', 'price', 'category', 'refine'], author: 'CommerceKit' },
  { id: 'ecommerce-banner-ad', name: 'Promotional Banner', desc: 'Hero banners and promotional strips for sales and offers.', cat: 'e-commerce', icon: 'Flag', tags: ['banner', 'promo', 'sale', 'offer', 'hero'], author: 'CommerceKit' },

  // ── Presentation (10) ──
  { id: 'pres-title-slide', name: 'Title Slide', desc: 'Presentation title slides with headline, subtitle, and branding.', cat: 'presentation', icon: 'Presentation', tags: ['title', 'slide', 'cover', 'headline'], author: 'SlideKit' },
  { id: 'pres-content-slide', name: 'Content Slide', desc: 'Text and image content slides with bullet points and media.', cat: 'presentation', icon: 'FileText', tags: ['content', 'text', 'bullet', 'media'], author: 'SlideKit' },
  { id: 'pres-two-column', name: 'Two Column Layout', desc: 'Split layout slides for comparisons and side-by-side content.', cat: 'presentation', icon: 'Columns', tags: ['two-column', 'split', 'comparison', 'layout'], author: 'SlideKit' },
  { id: 'pres-image-focus', name: 'Image Focus Slide', desc: 'Full-bleed and half-bleed image slides with overlay text.', cat: 'presentation', icon: 'Image', tags: ['image', 'full-bleed', 'photo', 'visual'], author: 'SlideKit' },
  { id: 'pres-chart-slide', name: 'Chart Slide', desc: 'Pre-formatted slides for presenting data charts and metrics.', cat: 'presentation', icon: 'BarChart3', tags: ['chart', 'data', 'metric', 'graph'], author: 'SlideKit' },
  { id: 'pres-quote-slide', name: 'Quote Slide', desc: 'Typography-focused quote slides with attribution.', cat: 'presentation', icon: 'Quote', tags: ['quote', 'typography', 'text', 'citation'], author: 'SlideKit' },
  { id: 'pres-team-slide', name: 'Team Slide', desc: 'Team member grid with photos, names, roles, and bios.', cat: 'presentation', icon: 'Users', tags: ['team', 'people', 'grid', 'profile'], author: 'SlideKit' },
  { id: 'pres-timeline-slide', name: 'Timeline Slide', desc: 'Timeline and roadmap slides for processes and milestones.', cat: 'presentation', icon: 'Clock', tags: ['timeline', 'roadmap', 'process', 'milestone'], author: 'SlideKit' },
  { id: 'pres-thank-you', name: 'Thank You Slide', desc: 'Closing slides with CTA, contact info, and Q&A prompt.', cat: 'presentation', icon: 'Heart', tags: ['closing', 'thank-you', 'cta', 'contact'], author: 'SlideKit' },
  { id: 'pres-process-flow', name: 'Process Flow Slide', desc: 'Step-by-step process and workflow visualization slides.', cat: 'presentation', icon: 'Workflow', tags: ['process', 'flow', 'workflow', 'steps'], author: 'SlideKit' },

  // ── Forms (10) ──
  { id: 'forms-login-form', name: 'Login Form', desc: 'Email/password login form with remember me and forgot password.', cat: 'forms', icon: 'Lock', tags: ['login', 'sign-in', 'auth', 'password'], author: 'FormKit' },
  { id: 'forms-register-form', name: 'Registration Form', desc: 'Multi-field registration with validation and terms acceptance.', cat: 'forms', icon: 'UserPlus', tags: ['register', 'sign-up', 'account', 'validation'], author: 'FormKit' },
  { id: 'forms-contact-form', name: 'Contact Form', desc: 'Name, email, subject, and message form with submission feedback.', cat: 'forms', icon: 'Mail', tags: ['contact', 'message', 'email', 'feedback'], author: 'FormKit' },
  { id: 'forms-search-form', name: 'Advanced Search', desc: 'Multi-field search form with filters and sorting options.', cat: 'forms', icon: 'Search', tags: ['search', 'filter', 'advanced', 'query'], author: 'FormKit' },
  { id: 'forms-feedback-form', name: 'Feedback Form', desc: 'Rating, category, and text feedback collection form.', cat: 'forms', icon: 'MessageSquare', tags: ['feedback', 'rating', 'survey', 'review'], author: 'FormKit' },
  { id: 'forms-address-form', name: 'Address Form', desc: 'Multi-line address input with country, state, and ZIP validation.', cat: 'forms', icon: 'MapPin', tags: ['address', 'location', 'shipping', 'form'], author: 'FormKit' },
  { id: 'forms-payment-form', name: 'Payment Form', desc: 'Credit card, expiry, and CVV input form with formatting.', cat: 'forms', icon: 'CreditCard', tags: ['payment', 'credit-card', 'billing', 'form'], author: 'FormKit' },
  { id: 'forms-settings-form', name: 'Settings Form', desc: 'Profile and preference settings with toggles and selects.', cat: 'forms', icon: 'Settings', tags: ['settings', 'preferences', 'profile', 'config'], author: 'FormKit' },
  { id: 'forms-file-upload', name: 'File Upload Form', desc: 'Drag-and-drop file upload with preview and progress.', cat: 'forms', icon: 'Upload', tags: ['upload', 'file', 'drag-drop', 'attach'], author: 'FormKit' },
  { id: 'forms-multi-step-form', name: 'Multi-Step Form', desc: 'Wizard-style multi-step form with progress indicator.', cat: 'forms', icon: 'ListTodo', tags: ['multi-step', 'wizard', 'progress', 'steps'], author: 'FormKit' },

  // ── Navigation (10) ──
  { id: 'nav-top-bar', name: 'Top Navigation Bar', desc: 'Horizontal top navigation with logo, links, and actions.', cat: 'navigation', icon: 'PanelTop', tags: ['top-bar', 'horizontal', 'header', 'links'], author: 'NavKit' },
  { id: 'nav-sidebar-menu', name: 'Sidebar Menu', desc: 'Vertical sidebar navigation with icons, labels, and sub-menus.', cat: 'navigation', icon: 'Sidebar', tags: ['sidebar', 'vertical', 'menu', 'sub-menu'], author: 'NavKit' },
  { id: 'nav-bottom-tabs', name: 'Bottom Tab Bar', desc: 'Mobile bottom tab navigation with icons and active states.', cat: 'navigation', icon: 'Smartphone', tags: ['bottom-tab', 'mobile', 'tab-bar', 'ios'], author: 'NavKit' },
  { id: 'nav-breadcrumbs', name: 'Breadcrumbs', desc: 'Breadcrumb navigation showing page hierarchy and path.', cat: 'navigation', icon: 'ChevronRight', tags: ['breadcrumb', 'hierarchy', 'path', 'location'], author: 'NavKit' },
  { id: 'nav-hamburger-menu', name: 'Hamburger Menu', desc: 'Responsive hamburger menu with slide-out drawer panel.', cat: 'navigation', icon: 'Menu', tags: ['hamburger', 'responsive', 'drawer', 'mobile'], author: 'NavKit' },
  { id: 'nav-mega-menu', name: 'Mega Menu', desc: 'Large dropdown mega menu with multi-column categories.', cat: 'navigation', icon: 'LayoutGrid', tags: ['mega-menu', 'dropdown', 'multi-column', 'categories'], author: 'NavKit' },
  { id: 'nav-tab-navigation', name: 'Tab Navigation', desc: 'Horizontal and vertical tab navigation for section switching.', cat: 'navigation', icon: 'Layers', tags: ['tab', 'switching', 'sections', 'horizontal'], author: 'NavKit' },
  { id: 'nav-pagination', name: 'Pagination', desc: 'Page number pagination with prev/next and page size control.', cat: 'navigation', icon: 'ChevronLeft', tags: ['pagination', 'pages', 'prev-next', 'numbering'], author: 'NavKit' },
  { id: 'nav-steps-indicator', name: 'Steps Indicator', desc: 'Step progress indicator for multi-step flows and processes.', cat: 'navigation', icon: 'ListTodo', tags: ['steps', 'progress', 'indicator', 'wizard'], author: 'NavKit' },
  { id: 'nav-semantic-nav', name: 'Semantic Nav', desc: 'Accessible navigation with ARIA landmarks and keyboard support.', cat: 'navigation', icon: 'Compass', tags: ['accessibility', 'aria', 'semantic', 'keyboard'], author: 'NavKit' },

  // ── Cards (12) ──
  { id: 'cards-profile-card', name: 'Profile Card', desc: 'User profile card with avatar, name, role, and social links.', cat: 'cards', icon: 'User', tags: ['profile', 'avatar', 'user', 'bio'], author: 'CardKit' },
  { id: 'cards-blog-card', name: 'Blog Post Card', desc: 'Article preview card with image, title, excerpt, and meta.', cat: 'cards', icon: 'FileText', tags: ['blog', 'article', 'preview', 'content'], author: 'CardKit' },
  { id: 'cards-stats-card', name: 'Statistics Card', desc: 'KPI and metric display card with trend indicators.', cat: 'cards', icon: 'TrendingUp', tags: ['stats', 'kpi', 'metric', 'trend', 'number'], author: 'CardKit' },
  { id: 'cards-media-card', name: 'Media Card', desc: 'Image/video card with overlay text and play button.', cat: 'cards', icon: 'Image', tags: ['media', 'image', 'video', 'overlay'], author: 'CardKit' },
  { id: 'cards-feature-card', name: 'Feature Card', desc: 'Product feature highlight card with icon, title, and description.', cat: 'cards', icon: 'Star', tags: ['feature', 'highlight', 'product', 'icon'], author: 'CardKit' },
  { id: 'cards-pricing-card', name: 'Pricing Card', desc: 'Plan pricing card with features list, price, and CTA button.', cat: 'cards', icon: 'CreditCard', tags: ['pricing', 'plan', 'features', 'cta'], author: 'CardKit' },
  { id: 'cards-notification-card', name: 'Notification Card', desc: 'Alert and notification card with icon, message, and actions.', cat: 'cards', icon: 'Bell', tags: ['notification', 'alert', 'message', 'action'], author: 'CardKit' },
  { id: 'cards-invitation-card', name: 'Invitation Card', desc: 'Event invitation card with decorative elements and RSVP.', cat: 'cards', icon: 'Mail', tags: ['invitation', 'event', 'rsvp', 'decorative'], author: 'CardKit' },
  { id: 'cards-testimonial-card', name: 'Testimonial Card', desc: 'Customer testimonial with quote, avatar, and rating stars.', cat: 'cards', icon: 'MessageSquare', tags: ['testimonial', 'review', 'quote', 'rating'], author: 'CardKit' },
  { id: 'cards-recipe-card', name: 'Recipe Card', desc: 'Food recipe card with image, ingredients, and instructions.', cat: 'cards', icon: 'CookingPot', tags: ['recipe', 'food', 'ingredients', 'instructions'], author: 'CardKit' },
  { id: 'cards-music-card', name: 'Music Card', desc: 'Song/album card with cover art, title, artist, and play controls.', cat: 'cards', icon: 'Music', tags: ['music', 'song', 'album', 'player'], author: 'CardKit' },
  { id: 'cards-weather-card', name: 'Weather Card', desc: 'Weather display card with temperature, icon, and forecast.', cat: 'cards', icon: 'Sun', tags: ['weather', 'temperature', 'forecast', 'climate'], author: 'CardKit' },

  // ── Tables (8) ──
  { id: 'tables-data-table', name: 'Data Table', desc: 'Sortable, filterable data table with row actions and selection.', cat: 'tables', icon: 'Rows', tags: ['data', 'sort', 'filter', 'select', 'grid'], author: 'TableKit' },
  { id: 'tables-comparison-table', name: 'Comparison Table', desc: 'Feature comparison table for products or plans.', cat: 'tables', icon: 'Columns', tags: ['comparison', 'feature', 'product', 'plan'], author: 'TableKit' },
  { id: 'tables-pricing-table', name: 'Pricing Table', desc: 'Multi-column pricing table with feature rows and CTAs.', cat: 'tables', icon: 'DollarSign', tags: ['pricing', 'plan', 'feature', 'column'], author: 'TableKit' },
  { id: 'tables-schedule-table', name: 'Schedule Table', desc: 'Time-based schedule and timetable with time slots.', cat: 'tables', icon: 'Calendar', tags: ['schedule', 'timetable', 'time', 'slots'], author: 'TableKit' },
  { id: 'tables-spec-table', name: 'Spec Table', desc: 'Technical specification table with grouped rows.', cat: 'tables', icon: 'FileText', tags: ['spec', 'technical', 'grouped', 'detail'], author: 'TableKit' },
  { id: 'tables-team-roster', name: 'Team Roster Table', desc: 'Team member table with roles, status, and contact info.', cat: 'tables', icon: 'Users', tags: ['team', 'roster', 'member', 'role'], author: 'TableKit' },
  { id: 'tables-asset-inventory', name: 'Asset Inventory Table', desc: 'Inventory and asset management table with categories.', cat: 'tables', icon: 'Package', tags: ['inventory', 'asset', 'stock', 'category'], author: 'TableKit' },
  { id: 'tables-api-reference', name: 'API Reference Table', desc: 'API endpoint documentation table with parameters.', cat: 'tables', icon: 'FileCode', tags: ['api', 'endpoint', 'parameter', 'docs'], author: 'TableKit' },

  // ── Modals (8) ──
  { id: 'modals-confirm-dialog', name: 'Confirm Dialog', desc: 'Confirmation dialog with title, message, and confirm/cancel actions.', cat: 'modals', icon: 'AlertTriangle', tags: ['confirm', 'dialog', 'delete', 'warning'], author: 'ModalKit' },
  { id: 'modals-image-lightbox', name: 'Image Lightbox', desc: 'Full-screen image viewer with navigation and zoom.', cat: 'modals', icon: 'Maximize', tags: ['lightbox', 'image', 'viewer', 'zoom', 'gallery'], author: 'ModalKit' },
  { id: 'modals-form-modal', name: 'Form Modal', desc: 'Modal dialog containing a form with validation and submission.', cat: 'modals', icon: 'FileText', tags: ['form', 'modal', 'input', 'submit'], author: 'ModalKit' },
  { id: 'modals-detail-panel', name: 'Detail Panel', desc: 'Slide-in detail panel for viewing item information.', cat: 'modals', icon: 'PanelRight', tags: ['panel', 'detail', 'slide-in', 'info'], author: 'ModalKit' },
  { id: 'modals-delete-confirm', name: 'Delete Confirmation', desc: 'Danger-styled delete confirmation with undo option.', cat: 'modals', icon: 'Trash2', tags: ['delete', 'danger', 'confirm', 'undo'], author: 'ModalKit' },
  { id: 'modals-share-dialog', name: 'Share Dialog', desc: 'Share modal with link copy, social sharing, and permissions.', cat: 'modals', icon: 'Share', tags: ['share', 'link', 'social', 'permission'], author: 'ModalKit' },
  { id: 'modals-command-palette', name: 'Command Palette', desc: 'Searchable command palette for quick actions and navigation.', cat: 'modals', icon: 'Terminal', tags: ['command', 'palette', 'search', 'quick-action'], author: 'ModalKit' },
  { id: 'modals-video-player', name: 'Video Player Modal', desc: 'Embedded video player modal with controls and fullscreen.', cat: 'modals', icon: 'Video', tags: ['video', 'player', 'embed', 'controls'], author: 'ModalKit' },

  // ── Video (5) ──
  { id: 'video-player-frame', name: 'Video Player Frame', desc: 'Video player UI frame with controls, progress bar, and overlay.', cat: 'video', icon: 'Video', tags: ['video', 'player', 'controls', 'playback'], author: 'MediaKit' },
  { id: 'video-thumbnail-gen', name: 'Thumbnail Generator', desc: 'Generate video thumbnail frames with timestamp overlays.', cat: 'video', icon: 'Camera', tags: ['thumbnail', 'frame', 'timestamp', 'preview'], author: 'MediaKit' },
  { id: 'video-storyboard', name: 'Storyboard Template', desc: 'Video storyboard layout with scene frames and notes.', cat: 'video', icon: 'LayoutGrid', tags: ['storyboard', 'scene', 'frame', 'notes', 'planning'], author: 'MediaKit' },
  { id: 'video-subtitle-overlay', name: 'Subtitle Overlay', desc: 'Subtitle and caption overlay templates for video content.', cat: 'video', icon: 'Type', tags: ['subtitle', 'caption', 'overlay', 'text'], author: 'MediaKit' },
  { id: 'video-end-screen', name: 'End Screen', desc: 'YouTube-style end screen with subscribe and video suggestions.', cat: 'video', icon: 'Monitor', tags: ['end-screen', 'subscribe', 'suggest', 'youtube'], author: 'MediaKit' },

  // ── Audio (5) ──
  { id: 'audio-waveform', name: 'Audio Waveform', desc: 'Audio waveform visualization for podcast and music interfaces.', cat: 'audio', icon: 'Activity', tags: ['waveform', 'audio', 'sound', 'visualization'], author: 'AudioKit' },
  { id: 'audio-player-ui', name: 'Audio Player UI', desc: 'Music/podcast player interface with controls and progress.', cat: 'audio', icon: 'Music', tags: ['player', 'music', 'podcast', 'controls'], author: 'AudioKit' },
  { id: 'audio-podcast-card', name: 'Podcast Card', desc: 'Podcast episode card with play button and episode info.', cat: 'audio', icon: 'Mic', tags: ['podcast', 'episode', 'play', 'card'], author: 'AudioKit' },
  { id: 'audio-equalizer', name: 'Equalizer Visual', desc: 'Audio equalizer bar visualization for music apps.', cat: 'audio', icon: 'BarChart3', tags: ['equalizer', 'bars', 'music', 'frequency'], author: 'AudioKit' },
  { id: 'audio-voice-recorder', name: 'Voice Recorder UI', desc: 'Voice recording interface with waveform, timer, and controls.', cat: 'audio', icon: 'Mic', tags: ['recorder', 'voice', 'record', 'timer'], author: 'AudioKit' },

  // ── Kanban (5) ──
  { id: 'kanban-board', name: 'Kanban Board', desc: 'Full kanban board with columns, cards, and drag zones.', cat: 'kanban', icon: 'Kanban', tags: ['kanban', 'board', 'columns', 'drag', 'task'], author: 'ProjectKit' },
  { id: 'kanban-task-card', name: 'Task Card', desc: 'Kanban task card with title, labels, assignee, and priority.', cat: 'kanban', icon: 'StickyNote', tags: ['task', 'card', 'label', 'assignee', 'priority'], author: 'ProjectKit' },
  { id: 'kanban-sprint-board', name: 'Sprint Board', desc: 'Agile sprint board with story points and velocity.', cat: 'kanban', icon: 'Target', tags: ['sprint', 'agile', 'scrum', 'velocity', 'points'], author: 'ProjectKit' },
  { id: 'kanban-swimlane', name: 'Swimlane Layout', desc: 'Swimlane kanban with horizontal lanes for teams or categories.', cat: 'kanban', icon: 'Rows', tags: ['swimlane', 'lane', 'team', 'horizontal'], author: 'ProjectKit' },
  { id: 'kanban-backlog', name: 'Backlog View', desc: 'Product backlog list with priority, estimates, and sorting.', cat: 'kanban', icon: 'List', tags: ['backlog', 'priority', 'estimate', 'list'], author: 'ProjectKit' },

  // ── Dashboard Widgets (10) ──
  { id: 'dash-revenue-chart', name: 'Revenue Chart Widget', desc: 'Revenue trend chart widget for business dashboards.', cat: 'dashboard-widgets', icon: 'TrendingUp', tags: ['revenue', 'chart', 'trend', 'business'], author: 'DashKit' },
  { id: 'dash-user-stats', name: 'User Statistics', desc: 'User growth and activity metrics widget with sparklines.', cat: 'dashboard-widgets', icon: 'Users', tags: ['user', 'growth', 'activity', 'metrics'], author: 'DashKit' },
  { id: 'dash-task-summary', name: 'Task Summary', desc: 'Task completion and status breakdown widget.', cat: 'dashboard-widgets', icon: 'ListTodo', tags: ['task', 'completion', 'status', 'summary'], author: 'DashKit' },
  { id: 'dash-traffic-source', name: 'Traffic Sources', desc: 'Traffic source breakdown with pie chart and percentages.', cat: 'dashboard-widgets', icon: 'PieChart', tags: ['traffic', 'source', 'referral', 'analytics'], author: 'DashKit' },
  { id: 'dash-server-status', name: 'Server Status', desc: 'Server health and uptime monitoring widget.', cat: 'dashboard-widgets', icon: 'Server', tags: ['server', 'health', 'uptime', 'monitoring'], author: 'DashKit' },
  { id: 'dash-activity-feed', name: 'Activity Feed', desc: 'Real-time activity feed with avatars and timestamps.', cat: 'dashboard-widgets', icon: 'Activity', tags: ['activity', 'feed', 'real-time', 'timeline'], author: 'DashKit' },
  { id: 'dash-map-widget', name: 'Map Widget', desc: 'Geographic data visualization on a map widget.', cat: 'dashboard-widgets', icon: 'Map', tags: ['map', 'geographic', 'location', 'data'], author: 'DashKit' },
  { id: 'dash-calendar-widget', name: 'Calendar Widget', desc: 'Mini calendar with event dots and date selection.', cat: 'dashboard-widgets', icon: 'Calendar', tags: ['calendar', 'event', 'date', 'mini'], author: 'DashKit' },
  { id: 'dash-notification-center', name: 'Notification Center', desc: 'Notification list with categories, read status, and actions.', cat: 'dashboard-widgets', icon: 'Bell', tags: ['notification', 'alert', 'list', 'center'], author: 'DashKit' },
  { id: 'dash-quick-actions', name: 'Quick Actions', desc: 'Shortcut action buttons for common dashboard operations.', cat: 'dashboard-widgets', icon: 'Zap', tags: ['quick-action', 'shortcut', 'button', 'common'], author: 'DashKit' },

  // ── Maps (5) ──
  { id: 'maps-pin-marker', name: 'Map Pin Marker', desc: 'Location pin and marker icons for map interfaces.', cat: 'maps', icon: 'MapPin', tags: ['pin', 'marker', 'location', 'map'], author: 'MapKit' },
  { id: 'maps-route-line', name: 'Route Line', desc: 'Directional route lines and paths for navigation maps.', cat: 'maps', icon: 'Route', tags: ['route', 'path', 'direction', 'navigation'], author: 'MapKit' },
  { id: 'maps-location-card', name: 'Location Card', desc: 'Place information card with map preview and details.', cat: 'maps', icon: 'Building', tags: ['location', 'place', 'info', 'card'], author: 'MapKit' },
  { id: 'maps-geo-fence', name: 'Geofence Zone', desc: 'Circular and polygon geofence zone overlays.', cat: 'maps', icon: 'Circle', tags: ['geofence', 'zone', 'boundary', 'radius'], author: 'MapKit' },
  { id: 'maps-distance-scale', name: 'Distance Scale', desc: 'Map scale bar and distance measurement overlays.', cat: 'maps', icon: 'Ruler', tags: ['scale', 'distance', 'measurement', 'bar'], author: 'MapKit' },

  // ── Additional for Existing Categories ──

  // Shapes (+15)
  { id: 'shapes-diamond', name: 'Diamond', desc: 'Rotated square diamond shapes for decorative and UI elements.', cat: 'shapes', icon: 'Diamond', tags: ['diamond', 'rhombus', 'rotated', 'square'], author: 'ShapeForge' },
  { id: 'shapes-cross', name: 'Cross Shape', desc: 'Plus/cross shapes for medical, religious, and UI use.', cat: 'shapes', icon: 'Plus', tags: ['cross', 'plus', 'medical', 'symbol'], author: 'ShapeForge' },
  { id: 'shapes-heart', name: 'Heart Shape', desc: 'Heart shapes for Valentine, love, and favorite UI elements.', cat: 'shapes', icon: 'Heart', tags: ['heart', 'love', 'favorite', 'romantic'], author: 'ShapeForge' },
  { id: 'shapes-crescent', name: 'Crescent Moon', desc: 'Crescent and lunar shapes for night and spiritual themes.', cat: 'shapes', icon: 'Moon', tags: ['crescent', 'moon', 'lunar', 'night'], author: 'ShapeForge' },
  { id: 'shapes-ribbon', name: 'Ribbon Banner', desc: 'Decorative ribbon and banner shapes for headings and awards.', cat: 'shapes', icon: 'Award', tags: ['ribbon', 'banner', 'award', 'heading'], author: 'ShapeForge' },
  { id: 'shapes-frame-border', name: 'Frame Border', desc: 'Decorative frame and border shapes for photos and content.', cat: 'shapes', icon: 'Frame', tags: ['frame', 'border', 'decorative', 'photo'], author: 'ShapeForge' },
  { id: 'shapes-spiral', name: 'Spiral Shape', desc: 'Spiral and vortex shapes for creative and abstract designs.', cat: 'shapes', icon: 'RefreshCw', tags: ['spiral', 'vortex', 'abstract', 'creative'], author: 'ShapeForge' },
  { id: 'shapes-zigzag', name: 'Zigzag Line', desc: 'Zigzag and sawtooth patterns for dividers and decorations.', cat: 'shapes', icon: 'Zap', tags: ['zigzag', 'sawtooth', 'pattern', 'divider'], author: 'ShapeForge' },
  { id: 'shapes-wave', name: 'Wave Shape', desc: 'Wave and sine curve shapes for backgrounds and dividers.', cat: 'shapes', icon: 'Waves', tags: ['wave', 'sine', 'curve', 'background'], author: 'ShapeForge' },
  { id: 'shapes-grid-pattern', name: 'Grid Pattern', desc: 'Grid and dot pattern shapes for backgrounds and textures.', cat: 'shapes', icon: 'Grid3x3', tags: ['grid', 'dot', 'pattern', 'texture', 'background'], author: 'ShapeForge' },
  { id: 'shapes-arrow-badge', name: 'Arrow Badge', desc: 'Arrow-shaped badges and labels for CTAs and tags.', cat: 'shapes', icon: 'ArrowRight', tags: ['arrow', 'badge', 'label', 'cta', 'tag'], author: 'ShapeForge' },
  { id: 'shapes-teardrop', name: 'Teardrop', desc: 'Teardrop and water drop shapes for tooltips and decorations.', cat: 'shapes', icon: 'Droplets', tags: ['teardrop', 'drop', 'water', 'tooltip'], author: 'ShapeForge' },
  { id: 'shapes-shield-shape', name: 'Shield Shape', desc: 'Shield and crest shapes for security and badge designs.', cat: 'shapes', icon: 'Shield', tags: ['shield', 'security', 'badge', 'crest'], author: 'ShapeForge' },
  { id: 'shapes-cloud-shape', name: 'Cloud Shape', desc: 'Cloud shapes for weather, hosting, and decorative use.', cat: 'shapes', icon: 'Cloud', tags: ['cloud', 'weather', 'hosting', 'sky'], author: 'ShapeForge' },
  { id: 'shapes-lightning', name: 'Lightning Bolt', desc: 'Lightning bolt shapes for energy, speed, and alert designs.', cat: 'shapes', icon: 'Zap', tags: ['lightning', 'bolt', 'energy', 'speed', 'alert'], author: 'ShapeForge' },

  // Charts (+10)
  { id: 'charts-stacked-bar', name: 'Stacked Bar Chart', desc: 'Stacked bar chart showing component breakdowns per category.', cat: 'charts', icon: 'BarChart3', tags: ['stacked', 'bar', 'component', 'breakdown'], author: 'ChartPro' },
  { id: 'charts-grouped-bar', name: 'Grouped Bar Chart', desc: 'Grouped bar chart comparing multiple data series side by side.', cat: 'charts', icon: 'BarChart3', tags: ['grouped', 'bar', 'comparison', 'series'], author: 'ChartPro' },
  { id: 'charts-horizontal-bar', name: 'Horizontal Bar Chart', desc: 'Horizontal bar chart for ranking and comparison views.', cat: 'charts', icon: 'BarChart3', tags: ['horizontal', 'bar', 'ranking', 'comparison'], author: 'ChartPro' },
  { id: 'charts-donut', name: 'Donut Chart', desc: 'Donut/ring chart with center label for part-to-whole data.', cat: 'charts', icon: 'Circle', tags: ['donut', 'ring', 'percentage', 'part-whole'], author: 'ChartPro' },
  { id: 'charts-multi-line', name: 'Multi-Line Chart', desc: 'Multi-series line chart for trend comparisons.', cat: 'charts', icon: 'LineChart', tags: ['multi-line', 'series', 'trend', 'comparison'], author: 'ChartPro' },
  { id: 'charts-combo-chart', name: 'Combo Chart', desc: 'Combined bar and line chart for dual-axis data.', cat: 'charts', icon: 'BarChart3', tags: ['combo', 'dual-axis', 'bar-line', 'mixed'], author: 'ChartPro' },
  { id: 'charts-progress-bar-chart', name: 'Progress Bar Chart', desc: 'Horizontal progress bars for goal tracking and comparison.', cat: 'charts', icon: 'Activity', tags: ['progress', 'bar', 'goal', 'tracking'], author: 'ChartPro' },
  { id: 'charts-matrix-heatmap', name: 'Matrix Heatmap', desc: 'Color-coded matrix for correlation and intensity display.', cat: 'charts', icon: 'Grid3x3', tags: ['matrix', 'heatmap', 'correlation', 'intensity'], author: 'ChartPro' },
  { id: 'charts-treemap-pro', name: 'Treemap Pro', desc: 'Advanced treemap with drill-down and color coding.', cat: 'charts', icon: 'LayoutGrid', tags: ['treemap', 'drill-down', 'hierarchy', 'color'], author: 'ChartPro' },
  { id: 'charts-bullet-chart', name: 'Bullet Chart', desc: 'Bullet graph for performance against target ranges.', cat: 'charts', icon: 'Target', tags: ['bullet', 'target', 'performance', 'range'], author: 'ChartPro' },

  // Icons (+10)
  { id: 'icons-social-icons', name: 'Social Media Icons', desc: 'Icon set for all major social media platforms.', cat: 'icons', icon: 'Globe', tags: ['social', 'media', 'platform', 'brand'], author: 'IconForge' },
  { id: 'icons-arrows-set', name: 'Arrows Icon Set', desc: 'Comprehensive directional arrows in all styles and weights.', cat: 'icons', icon: 'ArrowRight', tags: ['arrow', 'direction', 'navigation', 'set'], author: 'IconForge' },
  { id: 'icons-weather-icons', name: 'Weather Icons', desc: 'Sunny, cloudy, rainy, snowy, and severe weather icon set.', cat: 'icons', icon: 'Sun', tags: ['weather', 'sun', 'rain', 'snow', 'cloud'], author: 'IconForge' },
  { id: 'icons-file-type-icons', name: 'File Type Icons', desc: 'Icons for all common file types: PDF, DOC, XLS, JPG, etc.', cat: 'icons', icon: 'File', tags: ['file', 'type', 'document', 'format'], author: 'IconForge' },
  { id: 'icons-device-icons', name: 'Device Icons', desc: 'Laptop, phone, tablet, desktop, watch, and IoT device icons.', cat: 'icons', icon: 'Monitor', tags: ['device', 'laptop', 'phone', 'tablet'], author: 'IconForge' },
  { id: 'icons-communication-icons', name: 'Communication Icons', desc: 'Email, chat, phone, video call, and notification icons.', cat: 'icons', icon: 'MessageSquare', tags: ['communication', 'email', 'chat', 'call'], author: 'IconForge' },
  { id: 'icons-commerce-icons', name: 'Commerce Icons', desc: 'Shopping, payment, shipping, cart, and store icons.', cat: 'icons', icon: 'ShoppingCart', tags: ['commerce', 'shopping', 'payment', 'store'], author: 'IconForge' },
  { id: 'icons-security-icons', name: 'Security Icons', desc: 'Lock, shield, key, fingerprint, and verification icons.', cat: 'icons', icon: 'Shield', tags: ['security', 'lock', 'shield', 'key', 'auth'], author: 'IconForge' },
  { id: 'icons-devices-frame', name: 'Device Frames', desc: 'Realistic device frame mockups for app previews.', cat: 'icons', icon: 'Smartphone', tags: ['frame', 'mockup', 'device', 'preview'], author: 'IconForge' },
  { id: 'icons-nature-icons', name: 'Nature Icons', desc: 'Trees, mountains, water, sun, moon, and weather icons.', cat: 'icons', icon: 'TreePine', tags: ['nature', 'tree', 'mountain', 'weather'], author: 'IconForge' },

  // Layout (+8)
  { id: 'layout-masonry-grid', name: 'Masonry Grid', desc: 'Pinterest-style masonry layout with variable-height cards.', cat: 'layout', icon: 'LayoutGrid', tags: ['masonry', 'pinterest', 'variable', 'grid'], author: 'LayoutPro' },
  { id: 'layout-split-screen', name: 'Split Screen', desc: '50/50 and 60/40 split screen layouts for comparisons.', cat: 'layout', icon: 'Columns', tags: ['split', 'half', 'comparison', 'side-by-side'], author: 'LayoutPro' },
  { id: 'layout-full-width', name: 'Full Width Section', desc: 'Edge-to-edge full-width sections for hero and feature areas.', cat: 'layout', icon: 'Maximize', tags: ['full-width', 'edge-to-edge', 'section', 'hero'], author: 'LayoutPro' },
  { id: 'layout-asymmetric', name: 'Asymmetric Layout', desc: 'Creative asymmetric layouts with overlapping elements.', cat: 'layout', icon: 'Layers', tags: ['asymmetric', 'overlap', 'creative', 'dynamic'], author: 'LayoutPro' },
  { id: 'layout-grid-system', name: 'Grid System', desc: '12-column and 16-column grid system templates.', cat: 'layout', icon: 'Grid3x3', tags: ['grid', 'column', 'system', 'responsive'], author: 'LayoutPro' },
  { id: 'layout-bento-grid', name: 'Bento Grid', desc: 'Apple-style bento grid layout with varied card sizes.', cat: 'layout', icon: 'LayoutDashboard', tags: ['bento', 'apple', 'varied', 'widget'], author: 'LayoutPro', popular: true },
  { id: 'layout-zigzag-section', name: 'Zigzag Section', desc: 'Alternating image-text zigzag layout for feature sections.', cat: 'layout', icon: 'Zap', tags: ['zigzag', 'alternating', 'feature', 'section'], author: 'LayoutPro' },
  { id: 'layout-container', name: 'Container Template', desc: 'Pre-configured container layouts with max-width and padding.', cat: 'layout', icon: 'Box', tags: ['container', 'max-width', 'padding', 'wrapper'], author: 'LayoutPro' },

  // Wireframe (+8)
  { id: 'wireframe-ecommerce', name: 'E-Commerce Wireframe', desc: 'Product listing and detail page wireframe templates.', cat: 'wireframe', icon: 'ShoppingCart', tags: ['ecommerce', 'product', 'listing', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-blog-layout', name: 'Blog Wireframe', desc: 'Blog homepage and article page wireframe layouts.', cat: 'wireframe', icon: 'FileText', tags: ['blog', 'article', 'homepage', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-landing-page', name: 'Landing Page Wireframe', desc: 'SaaS landing page wireframe with hero, features, and CTA.', cat: 'wireframe', icon: 'Layout', tags: ['landing', 'saas', 'hero', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-settings-page', name: 'Settings Page Wireframe', desc: 'Settings and preferences page wireframe with form sections.', cat: 'wireframe', icon: 'Settings', tags: ['settings', 'preferences', 'form', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-profile-page', name: 'Profile Page Wireframe', desc: 'User profile page wireframe with avatar and activity.', cat: 'wireframe', icon: 'User', tags: ['profile', 'user', 'activity', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-chat-interface', name: 'Chat Interface Wireframe', desc: 'Messaging app wireframe with conversation list and chat view.', cat: 'wireframe', icon: 'MessageSquare', tags: ['chat', 'messaging', 'conversation', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-dashboard-layout', name: 'Dashboard Wireframe', desc: 'Analytics dashboard wireframe with charts and stat cards.', cat: 'wireframe', icon: 'LayoutDashboard', tags: ['dashboard', 'analytics', 'charts', 'wireframe'], author: 'WireKit' },
  { id: 'wireframe-auth-flow', name: 'Auth Flow Wireframe', desc: 'Login, register, and forgot password flow wireframes.', cat: 'wireframe', icon: 'Lock', tags: ['auth', 'login', 'register', 'flow', 'wireframe'], author: 'WireKit' },

  // Diagrams (+7)
  { id: 'diagrams-er-diagram', name: 'ER Diagram', desc: 'Entity-relationship diagram for database schema design.', cat: 'diagrams', icon: 'Database', tags: ['er', 'entity', 'relationship', 'database', 'schema'], author: 'DiagramPro' },
  { id: 'diagrams-class-diagram', name: 'Class Diagram', desc: 'UML class diagram for object-oriented software design.', cat: 'diagrams', icon: 'Box', tags: ['class', 'uml', 'object', 'inheritance'], author: 'DiagramPro' },
  { id: 'diagrams-sequence-diagram', name: 'Sequence Diagram', desc: 'UML sequence diagram for interaction and message flows.', cat: 'diagrams', icon: 'ArrowRight', tags: ['sequence', 'uml', 'interaction', 'message'], author: 'DiagramPro' },
  { id: 'diagrams-state-diagram', name: 'State Diagram', desc: 'State machine diagram for process flow and transitions.', cat: 'diagrams', icon: 'GitBranch', tags: ['state', 'machine', 'transition', 'process'], author: 'DiagramPro' },
  { id: 'diagrams-org-chart', name: 'Org Chart', desc: 'Organizational hierarchy chart with roles and reporting.', cat: 'diagrams', icon: 'Users', tags: ['org', 'hierarchy', 'organization', 'reporting'], author: 'DiagramPro' },
  { id: 'diagrams-infographic', name: 'Infographic Maker', desc: 'Data-driven infographic templates with icons and charts.', cat: 'diagrams', icon: 'Presentation', tags: ['infographic', 'data', 'visual', 'information'], author: 'DiagramPro' },
  { id: 'diagrams-process-map', name: 'Process Map', desc: 'Business process mapping with swimlanes and decision points.', cat: 'diagrams', icon: 'Workflow', tags: ['process', 'business', 'swimlane', 'decision'], author: 'DiagramPro' },

  // Text (+8)
  { id: 'text-heading-styles', name: 'Heading Styles Kit', desc: 'Pre-designed H1-H6 heading styles with decorative elements.', cat: 'text', icon: 'Type', tags: ['heading', 'h1', 'h2', 'typography', 'style'], author: 'TextPro' },
  { id: 'text-body-text', name: 'Body Text Styles', desc: 'Paragraph styles for different content types and reading modes.', cat: 'text', icon: 'FileText', tags: ['body', 'paragraph', 'reading', 'content'], author: 'TextPro' },
  { id: 'text-label-tag', name: 'Label & Tag Text', desc: 'Small label, tag, and caption text styles.', cat: 'text', icon: 'Tag', tags: ['label', 'tag', 'caption', 'small'], author: 'TextPro' },
  { id: 'text-blockquote', name: 'Blockquote Styles', desc: 'Styled blockquote variants with decorative borders and marks.', cat: 'text', icon: 'Quote', tags: ['blockquote', 'quote', 'border', 'decorative'], author: 'TextPro' },
  { id: 'text-code-block', name: 'Code Block', desc: 'Styled code blocks with syntax highlighting appearance.', cat: 'text', icon: 'FileCode', tags: ['code', 'syntax', 'programming', 'block'], author: 'TextPro' },
  { id: 'text-list-styles', name: 'List Styles', desc: 'Bullet, numbered, checkbox, and icon list variants.', cat: 'text', icon: 'List', tags: ['list', 'bullet', 'numbered', 'checkbox'], author: 'TextPro' },
  { id: 'text-link-styles', name: 'Link Styles', desc: 'Inline, button-style, and card-style link variants.', cat: 'text', icon: 'Link', tags: ['link', 'hyperlink', 'inline', 'button'], author: 'TextPro' },
  { id: 'text-cta-text', name: 'CTA Text Styles', desc: 'Call-to-action text with emphasis, arrows, and urgency.', cat: 'text', icon: 'MousePointer', tags: ['cta', 'call-to-action', 'emphasis', 'button'], author: 'TextPro' },

  // Images (+5)
  { id: 'images-image-grid', name: 'Image Grid', desc: 'Responsive image grid with gaps, rounded corners, and hover.', cat: 'images', icon: 'LayoutGrid', tags: ['grid', 'gallery', 'responsive', 'hover'], author: 'ImageKit' },
  { id: 'images-masonry-gallery', name: 'Masonry Gallery', desc: 'Pinterest-style masonry image gallery layout.', cat: 'images', icon: 'Layers', tags: ['masonry', 'gallery', 'pinterest', 'variable'], author: 'ImageKit' },
  { id: 'images-avatar-stack', name: 'Avatar Stack', desc: 'Overlapping avatar group for team and collaborator display.', cat: 'images', icon: 'Users', tags: ['avatar', 'stack', 'group', 'overlap', 'team'], author: 'ImageKit' },
  { id: 'images-before-after', name: 'Before/After Slider', desc: 'Image comparison slider for before/after views.', cat: 'images', icon: 'Columns', tags: ['before-after', 'comparison', 'slider', 'reveal'], author: 'ImageKit' },
  { id: 'images-placeholder-gen', name: 'Placeholder Generator', desc: 'Generate placeholder images with custom dimensions and colors.', cat: 'images', icon: 'Image', tags: ['placeholder', 'dummy', 'generator', 'lorem'], author: 'ImageKit' },

  // Colors (+5)
  { id: 'colors-gradient-generator', name: 'Gradient Generator', desc: 'Create and customize linear and radial gradients.', cat: 'colors', icon: 'Palette', tags: ['gradient', 'linear', 'radial', 'generator'], author: 'ColorLab' },
  { id: 'colors-palette-exporter', name: 'Palette Exporter', desc: 'Export color palettes to CSS, Tailwind, and design tokens.', cat: 'colors', icon: 'Download', tags: ['palette', 'export', 'css', 'tailwind', 'token'], author: 'ColorLab' },
  { id: 'colors-contrast-checker', name: 'Contrast Checker', desc: 'WCAG color contrast ratio checker for accessibility.', cat: 'colors', icon: 'Eye', tags: ['contrast', 'wcag', 'accessibility', 'ratio'], author: 'ColorLab' },
  { id: 'colors-shade-generator', name: 'Shade Generator', desc: 'Generate color shades and tints from a base color.', cat: 'colors', icon: 'Layers', tags: ['shade', 'tint', 'base', 'palette', 'scale'], author: 'ColorLab' },
  { id: 'colors-color-blind-sim', name: 'Color Blind Simulator', desc: 'Simulate how designs look with different color vision deficiencies.', cat: 'colors', icon: 'EyeOff', tags: ['color-blind', 'daltonism', 'simulation', 'accessibility'], author: 'ColorLab' },

  // Export (+5)
  { id: 'export-avif-export', name: 'AVIF Export', desc: 'Export designs as AVIF format for next-gen web images.', cat: 'export', icon: 'Image', tags: ['avif', 'next-gen', 'image', 'web'], author: 'ExportPro' },
  { id: 'export-ico-export', name: 'ICO/Favicon Export', desc: 'Export as ICO favicon with multiple sizes.', cat: 'export', icon: 'Star', tags: ['ico', 'favicon', 'icon', 'multi-size'], author: 'ExportPro' },
  { id: 'export-webp-batch', name: 'WebP Batch Export', desc: 'Batch export all frames and assets as WebP.', cat: 'export', icon: 'Layers', tags: ['webp', 'batch', 'assets', 'frames'], author: 'ExportPro' },
  { id: 'export-figma-import', name: 'Figma Import', desc: 'Import Figma design files and convert to BranchBoard elements.', cat: 'export', icon: 'Download', tags: ['figma', 'import', 'convert', 'migrate'], author: 'ExportPro' },
  { id: 'export-sketch-import', name: 'Sketch Import', desc: 'Import Sketch files and convert elements.', cat: 'export', icon: 'Download', tags: ['sketch', 'import', 'convert', 'mac'], author: 'ExportPro' },

  // Templates (+8)
  { id: 'templates-saas-landing', name: 'SaaS Landing Template', desc: 'Complete SaaS landing page template with all sections.', cat: 'templates', icon: 'Layout', tags: ['saas', 'landing', 'page', 'template', 'complete'], author: 'TemplateHub' },
  { id: 'templates-portfolio-template', name: 'Portfolio Template', desc: 'Personal portfolio site template with project gallery.', cat: 'templates', icon: 'Briefcase', tags: ['portfolio', 'personal', 'gallery', 'project'], author: 'TemplateHub' },
  { id: 'templates-blog-template', name: 'Blog Template', desc: 'Blog homepage and article layout template.', cat: 'templates', icon: 'FileText', tags: ['blog', 'article', 'homepage', 'layout'], author: 'TemplateHub' },
  { id: 'templates-mobile-app', name: 'Mobile App Template', desc: 'Mobile app screens template with onboarding and main flow.', cat: 'templates', icon: 'Smartphone', tags: ['mobile', 'app', 'screen', 'onboarding'], author: 'TemplateHub' },
  { id: 'templates-design-system', name: 'Design System Template', desc: 'Complete design system template with tokens and components.', cat: 'templates', icon: 'Palette', tags: ['design-system', 'token', 'component', 'system'], author: 'TemplateHub' },
  { id: 'templates-email-template', name: 'Email Template', desc: 'HTML email design template with responsive layout.', cat: 'templates', icon: 'Mail', tags: ['email', 'html', 'responsive', 'newsletter'], author: 'TemplateHub' },
  { id: 'templates-resume-template', name: 'Resume Template', desc: 'Professional resume/CV design template.', cat: 'templates', icon: 'FileText', tags: ['resume', 'cv', 'professional', 'career'], author: 'TemplateHub' },
  { id: 'templates-invoice-template', name: 'Invoice Template', desc: 'Professional invoice design template with itemization.', cat: 'templates', icon: 'Receipt', tags: ['invoice', 'billing', 'professional', 'finance'], author: 'TemplateHub' },

  // AI Tools (+8)
  { id: 'ai-style-transfer', name: 'AI Style Transfer', desc: 'Apply artistic styles to designs using AI model inference.', cat: 'ai-tools', icon: 'Wand2', tags: ['style-transfer', 'artistic', 'ai', 'neural'], author: 'AILab' },
  { id: 'ai-color-suggest', name: 'AI Color Suggester', desc: 'Get AI-powered color palette suggestions based on context.', cat: 'ai-tools', icon: 'Sparkles', tags: ['color', 'suggestion', 'ai', 'palette'], author: 'AILab' },
  { id: 'ai-layout-suggest', name: 'AI Layout Suggester', desc: 'Smart layout suggestions based on content and hierarchy.', cat: 'ai-tools', icon: 'Layout', tags: ['layout', 'suggestion', 'ai', 'auto'], author: 'AILab' },
  { id: 'ai-image-bg-remove', name: 'AI Background Remover', desc: 'Remove image backgrounds automatically with AI.', cat: 'ai-tools', icon: 'Eraser', tags: ['background', 'remove', 'ai', 'cutout'], author: 'AILab' },
  { id: 'ai-content-writer', name: 'AI Content Writer', desc: 'Generate placeholder text and copy using AI language models.', cat: 'ai-tools', icon: 'PenTool', tags: ['content', 'copy', 'text', 'ai', 'generate'], author: 'AILab' },
  { id: 'ai-icon-generator', name: 'AI Icon Generator', desc: 'Generate custom icon concepts from text descriptions.', cat: 'ai-tools', icon: 'Sparkles', tags: ['icon', 'generate', 'ai', 'custom'], author: 'AILab' },
  { id: 'ai-design-review', name: 'AI Design Review', desc: 'Get automated design feedback on spacing, alignment, and consistency.', cat: 'ai-tools', icon: 'Eye', tags: ['review', 'feedback', 'ai', 'consistency'], author: 'AILab' },
  { id: 'ai-redesign', name: 'AI Redesign', desc: 'Generate alternative design variations from existing layouts.', cat: 'ai-tools', icon: 'RefreshCw', tags: ['redesign', 'variation', 'ai', 'alternative'], author: 'AILab' },

  // Collaboration (+5)
  { id: 'collab-annotation', name: 'Annotation Tool', desc: 'Pin comments and annotations directly on design elements.', cat: 'collaboration', icon: 'MessageSquare', tags: ['annotation', 'comment', 'pin', 'review'], author: 'CollabKit' },
  { id: 'collab-version-label', name: 'Version Label', desc: 'Add labels and descriptions to design versions.', cat: 'collaboration', icon: 'Tag', tags: ['version', 'label', 'description', 'history'], author: 'CollabKit' },
  { id: 'collab-activity-log', name: 'Activity Log', desc: 'Track all design changes with user activity timeline.', cat: 'collaboration', icon: 'History', tags: ['activity', 'log', 'timeline', 'audit'], author: 'CollabKit' },
  { id: 'collab-cursor-sharing', name: 'Cursor Sharing', desc: 'See real-time cursors and selections of collaborators.', cat: 'collaboration', icon: 'MousePointer', tags: ['cursor', 'real-time', 'presence', 'live'], author: 'CollabKit' },
  { id: 'collab-review-approval', name: 'Review & Approval', desc: 'Formal review workflow with approve/reject/feedback.', cat: 'collaboration', icon: 'Check', tags: ['review', 'approval', 'workflow', 'feedback'], author: 'CollabKit' },

  // Accessibility (+5)
  { id: 'a11y-screen-reader', name: 'Screen Reader Preview', desc: 'Preview how content will be read by screen readers.', cat: 'accessibility', icon: 'Eye', tags: ['screen-reader', 'preview', 'aria', 'reading'], author: 'A11yKit' },
  { id: 'a11y-focus-order', name: 'Focus Order Checker', desc: 'Visualize and verify keyboard focus order in designs.', cat: 'accessibility', icon: 'Target', tags: ['focus', 'keyboard', 'tab-order', 'navigation'], author: 'A11yKit' },
  { id: 'a11y-text-scaling', name: 'Text Scaling Preview', desc: 'Preview designs with 200% text scaling for readability.', cat: 'accessibility', icon: 'Type', tags: ['text-scaling', 'readability', 'font-size', 'zoom'], author: 'A11yKit' },
  { id: 'a11y-motion-safety', name: 'Motion Safety', desc: 'Check for animations that may trigger vestibular disorders.', cat: 'accessibility', icon: 'Activity', tags: ['motion', 'vestibular', 'animation', 'safety'], author: 'A11yKit' },
  { id: 'a11y-alt-text-gen', name: 'Alt Text Generator', desc: 'Generate descriptive alt text for images using AI.', cat: 'accessibility', icon: 'Image', tags: ['alt-text', 'image', 'description', 'ai'], author: 'A11yKit' },

  // Math (+5)
  { id: 'math-equation-renderer', name: 'Equation Renderer', desc: 'Render mathematical equations and formulas on the canvas.', cat: 'math', icon: 'Hash', tags: ['equation', 'formula', 'math', 'render'], author: 'MathKit' },
  { id: 'math-function-plotter', name: 'Function Plotter', desc: 'Plot mathematical functions as curves on the canvas.', cat: 'math', icon: 'LineChart', tags: ['function', 'plot', 'curve', 'graph', 'math'], author: 'MathKit' },
  { id: 'math-grid-paper', name: 'Graph Paper', desc: 'Printable graph paper with customizable grid sizes.', cat: 'math', icon: 'Grid3x3', tags: ['graph-paper', 'grid', 'printable', 'coordinate'], author: 'MathKit' },
  { id: 'math-geometry-tool', name: 'Geometry Tool', desc: 'Construct geometric shapes with precise measurements.', cat: 'math', icon: 'Compass', tags: ['geometry', 'construct', 'measure', 'precise'], author: 'MathKit' },
  { id: 'math-data-table', name: 'Math Data Table', desc: 'Organized data table for statistical and scientific data.', cat: 'math', icon: 'Rows', tags: ['data', 'table', 'statistical', 'scientific'], author: 'MathKit' },

  // Typography (+8)
  { id: 'typo-font-pairer', name: 'Font Pairing Tool', desc: 'Find harmonious font pairings for headings and body text.', cat: 'typography', icon: 'Type', tags: ['font', 'pairing', 'heading', 'body', 'harmony'], author: 'TypeKit' },
  { id: 'typo-type-scale', name: 'Type Scale Generator', desc: 'Generate consistent type scales with modular and golden ratios.', cat: 'typography', icon: 'Move', tags: ['scale', 'modular', 'ratio', 'consistent'], author: 'TypeKit' },
  { id: 'typo-text-wrapping', name: 'Text Wrapping Preview', desc: 'Preview how text wraps in different container widths.', cat: 'typography', icon: 'AlignLeft', tags: ['wrapping', 'container', 'width', 'preview'], author: 'TypeKit' },
  { id: 'typo-vertical-rhythm', name: 'Vertical Rhythm', desc: 'Set up consistent vertical rhythm with baseline grid.', cat: 'typography', icon: 'Rows', tags: ['vertical-rhythm', 'baseline', 'grid', 'spacing'], author: 'TypeKit' },
  { id: 'typo-open-type', name: 'OpenType Features', desc: 'Preview and apply OpenType font features like ligatures.', cat: 'typography', icon: 'Settings', tags: ['opentype', 'ligature', 'feature', 'font'], author: 'TypeKit' },
  { id: 'typo-letter-spacing', name: 'Letter Spacing Tool', desc: 'Visual tool for adjusting and previewing letter-spacing.', cat: 'typography', icon: 'Move', tags: ['letter-spacing', 'tracking', 'kerning', 'adjust'], author: 'TypeKit' },
  { id: 'typo-text-shadow', name: 'Text Shadow Studio', desc: 'Create and preview text shadow effects with layering.', cat: 'typography', icon: 'Layers', tags: ['text-shadow', 'effect', 'layer', 'shadow'], author: 'TypeKit' },
  { id: 'typo-text-gradient', name: 'Text Gradient', desc: 'Apply gradient colors to text with CSS-like controls.', cat: 'typography', icon: 'Palette', tags: ['text-gradient', 'color', 'gradient', 'fill'], author: 'TypeKit' },

  // Branding (+5)
  { id: 'brand-logo-constructor', name: 'Logo Constructor', desc: 'Build logos from shapes, text, and icon combinations.', cat: 'branding', icon: 'Crown', tags: ['logo', 'constructor', 'build', 'brand'], author: 'BrandKit' },
  { id: 'brand-style-guide', name: 'Style Guide Generator', desc: 'Auto-generate a style guide from design elements.', cat: 'branding', icon: 'Book', tags: ['style-guide', 'generate', 'document', 'brand'], author: 'BrandKit' },
  { id: 'brand-social-kit', name: 'Social Brand Kit', desc: 'Generate branded assets for all social platforms.', cat: 'branding', icon: 'Globe', tags: ['social', 'brand', 'asset', 'platform'], author: 'BrandKit' },
  { id: 'brand-letterhead', name: 'Letterhead Template', desc: 'Professional letterhead and stationery design template.', cat: 'branding', icon: 'FileText', tags: ['letterhead', 'stationery', 'professional', 'print'], author: 'BrandKit' },
  { id: 'brand-business-card', name: 'Business Card', desc: 'Business card design template with front and back.', cat: 'branding', icon: 'CreditCard', tags: ['business-card', 'contact', 'print', 'professional'], author: 'BrandKit' },

  // Animation (+10)
  { id: 'anim-lottie-preview', name: 'Lottie Preview', desc: 'Preview and place Lottie animation frames on canvas.', cat: 'animation', icon: 'Play', tags: ['lottie', 'animation', 'preview', 'json'], author: 'AnimKit' },
  { id: 'anim-timeline-editor', name: 'Timeline Editor', desc: 'Keyframe timeline for animating element properties.', cat: 'animation', icon: 'Clock', tags: ['timeline', 'keyframe', 'animate', 'properties'], author: 'AnimKit' },
  { id: 'anim-easing-curves', name: 'Easing Curve Editor', desc: 'Visual editor for custom easing and timing curves.', cat: 'animation', icon: 'Activity', tags: ['easing', 'curve', 'timing', 'custom'], author: 'AnimKit' },
  { id: 'anim-motion-path', name: 'Motion Path', desc: 'Animate elements along custom bezier paths.', cat: 'animation', icon: 'Move', tags: ['motion-path', 'bezier', 'animate', 'path'], author: 'AnimKit' },
  { id: 'anim-scroll-trigger', name: 'Scroll Trigger', desc: 'Trigger animations based on scroll position.', cat: 'animation', icon: 'ArrowDown', tags: ['scroll', 'trigger', 'animate', 'viewport'], author: 'AnimKit' },
  { id: 'anim-hover-effects', name: 'Hover Effects Kit', desc: 'Pre-built hover animation effects for interactive elements.', cat: 'animation', icon: 'MousePointer', tags: ['hover', 'effect', 'interactive', 'animation'], author: 'AnimKit' },
  { id: 'anim-loading-animations', name: 'Loading Animations', desc: 'Spinner, skeleton, and creative loading animations.', cat: 'animation', icon: 'RefreshCw', tags: ['loading', 'spinner', 'skeleton', 'waiting'], author: 'AnimKit' },
  { id: 'anim-micro-interactions', name: 'Micro Interactions', desc: 'Small animation feedback for buttons, toggles, and inputs.', cat: 'animation', icon: 'Zap', tags: ['micro', 'interaction', 'feedback', 'button'], author: 'AnimKit' },
  { id: 'anim-page-transitions', name: 'Page Transitions', desc: 'Smooth page transition animation presets.', cat: 'animation', icon: 'Maximize', tags: ['page', 'transition', 'smooth', 'navigate'], author: 'AnimKit' },
  { id: 'anim-stagger', name: 'Stagger Animation', desc: 'Create staggered entrance animations for lists and grids.', cat: 'animation', icon: 'Layers', tags: ['stagger', 'entrance', 'list', 'sequential'], author: 'AnimKit' },

  // Prototyping (+5)
  { id: 'proto-scroll-prototype', name: 'Scroll Prototype', desc: 'Create scroll-based prototypes with pinned and parallax elements.', cat: 'prototyping', icon: 'ArrowDown', tags: ['scroll', 'prototype', 'pin', 'parallax'], author: 'ProtoKit' },
  { id: 'proto-drag-prototype', name: 'Drag Prototype', desc: 'Add drag interactions to prototype elements.', cat: 'prototyping', icon: 'Move', tags: ['drag', 'interaction', 'prototype', 'moveable'], author: 'ProtoKit' },
  { id: 'proto-hover-state', name: 'Hover State', desc: 'Define hover and pressed states for prototype elements.', cat: 'prototyping', icon: 'MousePointer', tags: ['hover', 'pressed', 'state', 'interactive'], author: 'ProtoKit' },
  { id: 'proto-variable-props', name: 'Variable Properties', desc: 'Use variables to drive prototype properties and states.', cat: 'prototyping', icon: 'Sliders', tags: ['variable', 'property', 'state', 'dynamic'], author: 'ProtoKit' },
  { id: 'proto-component-variant', name: 'Component Variants', desc: 'Create and switch between component variants in prototypes.', cat: 'prototyping', icon: 'Layers', tags: ['variant', 'component', 'switch', 'state'], author: 'ProtoKit' },

  // 3D (+5)
  { id: '3d-cube-template', name: '3D Cube', desc: 'Isometric 3D cube with customizable faces and colors.', cat: '3d', icon: 'Box', tags: ['cube', 'isometric', '3d', 'faces'], author: '3DKit' },
  { id: '3d-pyramid', name: '3D Pyramid', desc: 'Isometric 3D pyramid with face customization.', cat: '3d', icon: 'Triangle', tags: ['pyramid', 'isometric', '3d', 'triangle'], author: '3DKit' },
  { id: '3d-sphere-render', name: '3D Sphere', desc: 'Shaded 3D sphere with gradient and lighting effects.', cat: '3d', icon: 'Circle', tags: ['sphere', 'shaded', '3d', 'gradient', 'light'], author: '3DKit' },
  { id: '3d-room-perspective', name: 'Room Perspective', desc: 'One-point perspective room and interior mockup.', cat: '3d', icon: 'Home', tags: ['room', 'perspective', 'interior', 'one-point'], author: '3DKit' },
  { id: '3d-isometric-grid', name: 'Isometric Grid', desc: 'Isometric dot grid for 3D illustration and diagrams.', cat: '3d', icon: 'Grid3x3', tags: ['isometric', 'grid', 'dot', '3d', 'diagram'], author: '3DKit' },

  // Illustration (+10)
  { id: 'illust-flat-people', name: 'Flat People', desc: 'Flat design character illustrations with customizable poses.', cat: 'illustration', icon: 'Users', tags: ['flat', 'people', 'character', 'illustration'], author: 'IllustKit' },
  { id: 'illust-abstract-shapes', name: 'Abstract Shapes', desc: 'Decorative abstract shape compositions for backgrounds.', cat: 'illustration', icon: 'Hexagon', tags: ['abstract', 'shape', 'decorative', 'background'], author: 'IllustKit' },
  { id: 'illust-nature-scene', name: 'Nature Scene', desc: 'Nature and landscape illustration elements.', cat: 'illustration', icon: 'Mountain', tags: ['nature', 'landscape', 'scene', 'outdoor'], author: 'IllustKit' },
  { id: 'illust-tech-illustration', name: 'Tech Illustration', desc: 'Technology and server illustrations for SaaS and dev.', cat: 'illustration', icon: 'Server', tags: ['tech', 'server', 'cloud', 'illustration'], author: 'IllustKit' },
  { id: 'illust-pattern-library', name: 'Pattern Library', desc: 'Seamless pattern illustrations for backgrounds and fills.', cat: 'illustration', icon: 'Grid3x3', tags: ['pattern', 'seamless', 'background', 'fill', 'tile'], author: 'IllustKit' },
  { id: 'illust-icon-illustration', name: 'Icon Illustration', desc: 'Hand-drawn and illustrated icon style for friendly UIs.', cat: 'illustration', icon: 'Pencil', tags: ['icon', 'illustrated', 'hand-drawn', 'friendly'], author: 'IllustKit' },
  { id: 'illust-minimal-scene', name: 'Minimal Scene', desc: 'Minimalist scene compositions for hero sections.', cat: 'illustration', icon: 'Frame', tags: ['minimal', 'scene', 'hero', 'composition'], author: 'IllustKit' },
  { id: 'illust-gradient-mesh', name: 'Gradient Mesh', desc: 'Colorful gradient mesh backgrounds and decorative elements.', cat: 'illustration', icon: 'Palette', tags: ['gradient', 'mesh', 'colorful', 'background'], author: 'IllustKit' },
  { id: 'illust-geometric-pattern', name: 'Geometric Pattern', desc: 'Geometric line and shape patterns for modern designs.', cat: 'illustration', icon: 'Pentagon', tags: ['geometric', 'line', 'pattern', 'modern'], author: 'IllustKit' },
  { id: 'illust-isometric-scene', name: 'Isometric Scene', desc: 'Isometric 3D scene illustrations for tech and business.', cat: 'illustration', icon: 'Box', tags: ['isometric', '3d', 'scene', 'business', 'tech'], author: 'IllustKit' },

  // Photo Editing (+5)
  { id: 'photo-filters', name: 'Photo Filters', desc: 'Instagram-style photo filters with preview and adjustment.', cat: 'photo-editing', icon: 'Camera', tags: ['filter', 'instagram', 'photo', 'preset'], author: 'PhotoLab' },
  { id: 'photo-crop-tool', name: 'Smart Crop', desc: 'AI-powered crop suggestions for optimal composition.', cat: 'photo-editing', icon: 'Crop', tags: ['crop', 'ai', 'composition', 'smart'], author: 'PhotoLab' },
  { id: 'photo-color-adjust', name: 'Color Adjustment', desc: 'Brightness, contrast, saturation, and hue adjustments.', cat: 'photo-editing', icon: 'Sliders', tags: ['color', 'brightness', 'contrast', 'adjustment'], author: 'PhotoLab' },
  { id: 'photo-blur-bg', name: 'Background Blur', desc: 'Selective background blur for portrait and product photos.', cat: 'photo-editing', icon: 'Aperture', tags: ['blur', 'background', 'portrait', 'bokeh'], author: 'PhotoLab' },
  { id: 'photo-frame-overlay', name: 'Photo Frame Overlay', desc: 'Decorative frame overlays for photos and thumbnails.', cat: 'photo-editing', icon: 'Frame', tags: ['frame', 'overlay', 'decorative', 'border'], author: 'PhotoLab' },

  // Responsive (+5)
  { id: 'resp-breakpoint-preview', name: 'Breakpoint Preview', desc: 'Preview designs at all standard responsive breakpoints.', cat: 'responsive', icon: 'Monitor', tags: ['breakpoint', 'responsive', 'preview', 'standard'], author: 'RespKit' },
  { id: 'resp-fluid-typography', name: 'Fluid Typography', desc: 'Set up fluid font sizes that scale between breakpoints.', cat: 'responsive', icon: 'Type', tags: ['fluid', 'typography', 'scale', 'breakpoint'], author: 'RespKit' },
  { id: 'resp-container-query', name: 'Container Query', desc: 'Design with container query-based responsive layouts.', cat: 'responsive', icon: 'Box', tags: ['container-query', 'responsive', 'component'], author: 'RespKit' },
  { id: 'resp-mobile-first', name: 'Mobile First Grid', desc: 'Mobile-first responsive grid system templates.', cat: 'responsive', icon: 'Smartphone', tags: ['mobile-first', 'grid', 'responsive', 'progressive'], author: 'RespKit' },
  { id: 'resp-adaptive-layout', name: 'Adaptive Layout', desc: 'Adaptive layout that rearranges based on screen size.', cat: 'responsive', icon: 'LayoutDashboard', tags: ['adaptive', 'rearrange', 'screen', 'responsive'], author: 'RespKit' },

  // Code Gen (+5)
  { id: 'code-tailwind-gen', name: 'Tailwind CSS Gen', desc: 'Generate Tailwind CSS utility classes from design properties.', cat: 'code-gen', icon: 'Code', tags: ['tailwind', 'css', 'utility', 'generate'], author: 'CodeKit' },
  { id: 'code-react-gen', name: 'React Component Gen', desc: 'Export designs as React/Next.js component code.', cat: 'code-gen', icon: 'FileCode', tags: ['react', 'component', 'generate', 'jsx'], author: 'CodeKit' },
  { id: 'code-css-variables', name: 'CSS Variables Gen', desc: 'Generate CSS custom properties from design tokens.', cat: 'code-gen', icon: 'Sliders', tags: ['css', 'variables', 'tokens', 'custom-properties'], author: 'CodeKit' },
  { id: 'code-svg-export', name: 'SVG Code Export', desc: 'Export vector elements as clean SVG code.', cat: 'code-gen', icon: 'Code', tags: ['svg', 'vector', 'export', 'code'], author: 'CodeKit' },
  { id: 'code-html-email', name: 'HTML Email Code', desc: 'Generate table-based HTML email code from designs.', cat: 'code-gen', icon: 'Mail', tags: ['html', 'email', 'table', 'newsletter'], author: 'CodeKit' },

  // Handoff (+5)
  { id: 'handoff-css-inspector', name: 'CSS Inspector', desc: 'Click any element to see its CSS properties and values.', cat: 'handoff', icon: 'Code', tags: ['css', 'inspect', 'properties', 'values'], author: 'HandoffKit' },
  { id: 'handoff-asset-export', name: 'Asset Export Panel', desc: 'Batch export all design assets with naming conventions.', cat: 'handoff', icon: 'Download', tags: ['asset', 'export', 'batch', 'naming'], author: 'HandoffKit' },
  { id: 'handoff-spec-document', name: 'Spec Document', desc: 'Generate a design specification document with all details.', cat: 'handoff', icon: 'FileText', tags: ['spec', 'document', 'detail', 'generate'], author: 'HandoffKit' },
  { id: 'handoff-zeplin-style', name: 'Zeplin-Style Export', desc: 'Export designs in Zeplin-compatible format.', cat: 'handoff', icon: 'ExternalLink', tags: ['zeplin', 'export', 'format', 'compatible'], author: 'HandoffKit' },
  { id: 'handoff-dev-mode', name: 'Developer Mode', desc: 'Toggle developer mode with spacing guides and code hints.', cat: 'handoff', icon: 'Terminal', tags: ['developer', 'mode', 'spacing', 'code', 'guide'], author: 'HandoffKit' },
];

// Filter out duplicates and track
let addedCount = 0;
const pluginLines: string[] = [];
for (const p of plugins) {
  if (existingIds.has(p.id)) continue;
  existingIds.add(p.id);
  addedCount++;
  const popularLine = p.popular ? `\n  isPopular: true,` : '';
  const tagsStr = p.tags.map((t: string) => `'${t}'`).join(', ');
  pluginLines.push(`  {
    id: '${p.id}',
    name: '${p.name}',
    description: '${p.desc}',
    category: '${p.cat}' as PluginCategory,
    icon: '${p.icon}',
    isInstalled: false,${popularLine}
    tags: [${tagsStr}],
    version: '1.0.0',
    author: '${p.author}',
  },`);
}

console.log(`Added: ${addedCount}`);
console.log(`Total so far: ${existingIds.size}`);
console.log(`Need more: ${1000 - existingIds.size}`);

// Generate filler plugins to reach exactly 1000
const need = 1000 - existingIds.size;
if (need > 0) {
  const prefixes = ['Advanced', 'Pro', 'Essential', 'Smart', 'Quick', 'Auto', 'Turbo', 'Elite', 'Core', 'Plus', 'Extended', 'Enhanced', 'Optimized', 'Compact', 'Dynamic', 'Rapid', 'Ultra', 'Prime', 'Macro', 'Micro'];
  const suffixes = ['Toolkit', 'Suite', 'Pack', 'Collection', 'Set', 'Bundle', 'Library', 'Framework', 'System', 'Module'];
  const fillerIcons = ['Box', 'Circle', 'Square', 'Star', 'Heart', 'Zap', 'Shield', 'Code', 'Globe', 'Palette', 'Layers', 'Grid', 'Layout', 'Type', 'Image', 'File', 'Settings', 'Sliders', 'Search', 'Plus'];
  const fillerAuthors = ['OpenDesign', 'FreeUI', 'CommunityKit', 'DesignForge', 'PixelCraft', 'UIElements', 'ComponentLab', 'StyleForge', 'CanvasTools', 'DesignHub'];

  let idx = 0;
  for (let i = 0; i < need; i++) {
    const prefix = prefixes[idx % prefixes.length];
    const suffix = suffixes[Math.floor(idx / prefixes.length) % suffixes.length];
    const allCatsList = [...new Set([...Object.keys(categoryLabels), ...newCategories])];
    const catIdx = idx % allCatsList.length;
    const cat = allCatsList[catIdx];
    const icon = fillerIcons[idx % fillerIcons.length];
    const author = fillerAuthors[idx % fillerAuthors.length];
    const id = `${cat}-${prefix.toLowerCase()}-${suffix.toLowerCase()}-${Math.floor(idx / (prefixes.length * suffixes.length)) + 1}`;

    if (existingIds.has(id)) { i--; idx++; continue; }
    existingIds.add(id);
    const name = `${prefix} ${categoryLabels[cat] || cat} ${suffix}`;
    const desc = `${name} - Extended ${categoryLabels[cat] || cat} design capabilities with ${prefix.toLowerCase()} features.`;
    const tagsStr = `'${cat}', '${prefix.toLowerCase()}', '${suffix.toLowerCase()}', 'design'`;

    pluginLines.push(`  {
    id: '${id}',
    name: '${name}',
    description: '${desc}',
    category: '${cat}' as PluginCategory,
    icon: '${icon}',
    isInstalled: false,
    tags: [${tagsStr}],
    version: '1.0.0',
    author: '${author}',
  },`);
    idx++;
  }
}

console.log(`Final total: ${existingIds.size}`);

// Build the complete file
const allCats = [...new Set([...Object.keys(categoryLabels), ...newCategories])];
const catTypeStr = allCats.map((c: string) => `'${c}'`).join(' | ');
const catEntries = allCats.map((c: string) => `  { id: '${c}' as PluginCategory, label: '${categoryLabels[c] || c}' }`).join(',\n');

const existingPluginData = existingContent.split('\n').slice(43, -2).join('\n');

const finalContent = `export type PluginCategory = ${catTypeStr};

export interface DesignPlugin {
  id: string
  name: string
  description: string
  category: PluginCategory
  icon: string // lucide icon name
  isInstalled: boolean
  isPopular?: boolean
  tags: string[]
  version: string
  author: string
}

export const PLUGIN_CATEGORIES: { id: PluginCategory; label: string }[] = [
${catEntries},
];

export const DESIGN_PLUGINS: DesignPlugin[] = [
${existingPluginData},
${pluginLines.join('\n')}
]
`;

writeFileSync('/home/z/my-project/src/lib/plugins-data.ts', finalContent, 'utf-8');
console.log(`\nDone! File written. Total lines: ${finalContent.split('\n').length}`);