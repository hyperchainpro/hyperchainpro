export type CodeLanguage = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'svg' | 'markdown';

export interface CodeLayerData {
  html: string;
  css: string;
  js: string;
  language: CodeLanguage;
  autoRun: boolean;
  showLineNumbers: boolean;
  fontSize: number;
  theme: 'dark' | 'light' | 'monokai' | 'dracula';
  sandboxed: boolean;
}

export interface CodeTemplate {
  name: string;
  description: string;
  category: 'ui-component' | 'animation' | 'chart' | 'form' | 'layout' | 'art';
  code: CodeLayerData;
  defaultWidth: number;
  defaultHeight: number;
}

export const DEFAULT_CODE_LAYER: CodeLayerData = {
  html: '<div class="container">\n  <h2>Hello World</h2>\n  <p>Edit this code layer</p>\n</div>',
  css: '.container {\n  padding: 16px;\n  font-family: system-ui, sans-serif;\n  color: #1a1a2e;\n}\nh2 {\n  font-size: 20px;\n  margin: 0 0 8px;\n  font-weight: 700;\n}\np {\n  margin: 0;\n  opacity: 0.7;\n  font-size: 14px;\n}',
  js: '// Add interactivity here\nconsole.log("Code layer loaded!");',
  language: 'html',
  autoRun: true,
  showLineNumbers: true,
  fontSize: 13,
  theme: 'dark',
  sandboxed: true,
};

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    name: 'Button',
    description: 'Styled button variants',
    category: 'ui-component',
    defaultWidth: 280,
    defaultHeight: 200,
    code: {
      html: `<div class="btn-group">\n  <button class="btn primary">Primary</button>\n  <button class="btn secondary">Secondary</button>\n  <button class="btn outline">Outline</button>\n</div>`,
      css: `.btn-group { display:flex; flex-direction:column; gap:10px; padding:16px; font-family:system-ui; }\n.btn { padding:10px 24px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:transform .15s,box-shadow .15s; }\n.btn:hover { transform:translateY(-1px); }\n.btn:active { transform:translateY(0); }\n.primary { background:#10b981; color:#fff; box-shadow:0 2px 8px rgba(16,185,129,.3); }\n.secondary { background:#f1f5f9; color:#334155; }\n.outline { background:transparent; border:2px solid #10b981; color:#10b981; }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Card',
    description: 'Content card with image',
    category: 'ui-component',
    defaultWidth: 300,
    defaultHeight: 320,
    code: {
      html: `<div class="card">\n  <div class="card-img" style="background:linear-gradient(135deg,#f97316,#ec4899)"></div>\n  <div class="card-body">\n    <span class="tag">Design</span>\n    <h3>Beautiful Card</h3>\n    <p>A modern card component with gradient header and clean typography.</p>\n    <button class="card-btn">Learn More →</button>\n  </div>\n</div>`,
      css: `.card { border-radius:16px; overflow:hidden; background:#fff; box-shadow:0 4px 20px rgba(0,0,0,.08); font-family:system-ui; } .card-img { height:120px; } .card-body { padding:16px; } .tag { display:inline-block; padding:3px 10px; border-radius:20px; background:#f0fdf4; color:#16a34a; font-size:11px; font-weight:600; } h3 { margin:8px 0 4px; font-size:17px; color:#1a1a2e; } p { margin:0 0 12px; font-size:13px; color:#64748b; line-height:1.5; } .card-btn { background:none; border:none; color:#f97316; font-weight:600; font-size:13px; cursor:pointer; padding:0; }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Progress Bar',
    description: 'Animated progress indicators',
    category: 'ui-component',
    defaultWidth: 280,
    defaultHeight: 200,
    code: {
      html: `<div class="progress-group">\n  <div class="progress-item">\n    <div class="label"><span>Upload</span><span>72%</span></div>\n    <div class="bar"><div class="fill" style="width:72%"></div></div>\n  </div>\n  <div class="progress-item">\n    <div class="label"><span>Processing</span><span>45%</span></div>\n    <div class="bar"><div class="fill warn" style="width:45%"></div></div>\n  </div>\n  <div class="progress-item">\n    <div class="label"><span>Complete</span><span>100%</span></div>\n    <div class="bar"><div class="fill success" style="width:100%"></div></div>\n  </div>\n</div>`,
      css: `.progress-group { display:flex; flex-direction:column; gap:16px; padding:20px; font-family:system-ui; } .label { display:flex; justify-content:space-between; font-size:12px; color:#64748b; margin-bottom:6px; font-weight:500; } .bar { height:8px; background:#f1f5f9; border-radius:99px; overflow:hidden; } .fill { height:100%; border-radius:99px; background:#10b981; animation:grow 1s ease-out; } .warn { background:#f59e0b; } .success { background:#10b981; } @keyframes grow { from { width:0!important; } }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Bar Chart',
    description: 'CSS-only bar chart',
    category: 'chart',
    defaultWidth: 320,
    defaultHeight: 240,
    code: {
      html: `<div class="chart">\n  <div class="bars">\n    <div class="bar-col"><div class="bar" style="height:65%"><span>65</span></div><small>Jan</small></div>\n    <div class="bar-col"><div class="bar" style="height:82%"><span>82</span></div><small>Feb</small></div>\n    <div class="bar-col"><div class="bar" style="height:45%"><span>45</span></div><small>Mar</small></div>\n    <div class="bar-col"><div class="bar" style="height:91%"><span>91</span></div><small>Apr</small></div>\n    <div class="bar-col"><div class="bar" style="height:73%"><span>73</span></div><small>May</small></div>\n  </div>\n</div>`,
      css: `.chart { padding:20px; font-family:system-ui; } .bars { display:flex; align-items:flex-end; gap:12px; height:160px; padding-bottom:24px; position:relative; border-bottom:1px solid #e2e8f0; } .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; height:100%; justify-content:flex-end; } .bar { width:100%; max-width:32px; background:linear-gradient(to top,#10b981,#34d399); border-radius:6px 6px 0 0; animation:growUp .8s ease-out; position:relative; } .bar span { position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:600; color:#334155; } small { position:absolute; bottom:-20px; font-size:10px; color:#94a3b8; } @keyframes growUp { from { height:0!important; } }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Pie Chart',
    description: 'SVG donut chart',
    category: 'chart',
    defaultWidth: 220,
    defaultHeight: 220,
    code: {
      html: `<svg viewBox="0 0 120 120" class="pie">\n  <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="20" stroke-dasharray="110 204" stroke-dashoffset="0"/>\n  <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" stroke-width="20" stroke-dasharray="63 251" stroke-dashoffset="-110"/>\n  <circle cx="60" cy="60" r="50" fill="none" stroke="#ec4899" stroke-width="20" stroke-dasharray="78 236" stroke-dashoffset="-173"/>\n  <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" stroke-width="20" stroke-dasharray="63 251" stroke-dashoffset="-251"/>\n  <text x="60" y="56" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">314</text>\n  <text x="60" y="70" text-anchor="middle" font-size="8" fill="#94a3b8">Total</text>\n</svg>`,
      css: `.pie { width:100%; height:100%; animation:spin 1s ease-out; transform-origin:center; } @keyframes spin { from { transform:rotate(-90deg); } to { transform:rotate(0deg); } }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Login Form',
    description: 'Clean login form',
    category: 'form',
    defaultWidth: 280,
    defaultHeight: 320,
    code: {
      html: `<div class="form-card">\n  <h2>Sign In</h2>\n  <div class="field"><label>Email</label><input type="email" placeholder="you@example.com"/></div>\n  <div class="field"><label>Password</label><input type="password" placeholder="••••••••"/></div>\n  <button class="submit">Sign In</button>\n  <p class="link">Don't have an account? <a href="#">Sign up</a></p>\n</div>`,
      css: `.form-card { padding:24px; background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,.08); font-family:system-ui; } h2 { margin:0 0 20px; font-size:22px; color:#1a1a2e; } .field { margin-bottom:14px; } label { display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px; } input { width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; transition:border .2s; } input:focus { border-color:#10b981; } .submit { width:100%; padding:11px; background:#10b981; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; margin-top:6px; } .link { text-align:center; font-size:12px; color:#94a3b8; margin-top:14px; } a { color:#10b981; text-decoration:none; }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Gradient Art',
    description: 'CSS gradient composition',
    category: 'art',
    defaultWidth: 300,
    defaultHeight: 300,
    code: {
      html: `<div class="art">\n  <div class="orb orb1"></div>\n  <div class="orb orb2"></div>\n  <div class="orb orb3"></div>\n</div>`,
      css: `.art { width:100%; height:100%; background:#0f172a; position:relative; overflow:hidden; border-radius:12px; } .orb { position:absolute; border-radius:50%; filter:blur(60px); animation:float 6s ease-in-out infinite; } .orb1 { width:200px; height:200px; background:#f97316; top:-40px; left:-40px; } .orb2 { width:180px; height:180px; background:#10b981; bottom:-30px; right:-30px; animation-delay:-2s; } .orb3 { width:150px; height:150px; background:#ec4899; top:50%; left:50%; transform:translate(-50%,-50%); animation-delay:-4s; } @keyframes float { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(15px,-15px) scale(1.1); } 66% { transform:translate(-10px,10px) scale(0.95); } }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'CSS Animation',
    description: 'Bouncing balls animation',
    category: 'animation',
    defaultWidth: 300,
    defaultHeight: 200,
    code: {
      html: `<div class="scene">\n  <div class="ball b1"></div>\n  <div class="ball b2"></div>\n  <div class="ball b3"></div>\n  <div class="floor"></div>\n</div>`,
      css: `.scene { width:100%; height:100%; position:relative; overflow:hidden; background:#1e293b; border-radius:12px; } .ball { position:absolute; width:30px; height:30px; border-radius:50%; bottom:20px; animation:bounce 1.2s ease-in-out infinite; } .b1 { left:30%; background:#f97316; animation-delay:0s; } .b2 { left:50%; background:#10b981; animation-delay:0.3s; } .b3 { left:70%; background:#ec4899; animation-delay:0.6s; } .floor { position:absolute; bottom:0; left:0; right:0; height:20px; background:rgba(255,255,255,0.05); border-radius:2px; } @keyframes bounce { 0%,100% { transform:translateY(0); animation-timing-function:ease-out; } 50% { transform:translateY(-100px); animation-timing-function:ease-in; } }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Grid Layout',
    description: 'Responsive grid demo',
    category: 'layout',
    defaultWidth: 320,
    defaultHeight: 240,
    code: {
      html: `<div class="grid">\n  <div class="cell header">Header</div>\n  <div class="cell sidebar">Sidebar</div>\n  <div class="cell main">Main Content</div>\n  <div class="cell footer">Footer</div>\n</div>`,
      css: `.grid { display:grid; grid-template-columns:80px 1fr; grid-template-rows:40px 1fr 30px; gap:4px; height:100%; padding:4px; font-family:system-ui; font-size:11px; } .cell { border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:600; color:#fff; } .header { grid-column:1/-1; background:#10b981; } .sidebar { background:#f59e0b; } .main { background:#6366f1; } .footer { grid-column:1/-1; background:#334155; }`,
      js: '',
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
  {
    name: 'Countdown',
    description: 'Animated countdown timer',
    category: 'ui-component',
    defaultWidth: 280,
    defaultHeight: 160,
    code: {
      html: `<div class="countdown">\n  <div class="digit-group"><div class="digit" id="h">00</div><small>Hours</small></div>\n  <div class="sep">:</div>\n  <div class="digit-group"><div class="digit" id="m">00</div><small>Minutes</small></div>\n  <div class="sep">:</div>\n  <div class="digit-group"><div class="digit" id="s">00</div><small>Seconds</small></div>\n</div>`,
      css: `.countdown { display:flex; align-items:center; justify-content:center; gap:8px; padding:20px; font-family:system-ui; background:#0f172a; border-radius:16px; height:100%; box-sizing:border-box; } .digit-group { display:flex; flex-direction:column; align-items:center; gap:4px; } .digit { font-size:32px; font-weight:700; color:#10b981; font-variant-numeric:tabular-nums; min-width:52px; text-align:center; } small { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; } .sep { font-size:28px; color:#334155; font-weight:700; margin-top:-12px; }`,
      js: `let total=3600; function tick(){ const h=Math.floor(total/3600), m=Math.floor((total%3600)/60), s=total%60; document.getElementById('h').textContent=String(h).padStart(2,'0'); document.getElementById('m').textContent=String(m).padStart(2,'0'); document.getElementById('s').textContent=String(s).padStart(2,'0'); if(total>0)total--; } tick(); setInterval(tick,1000);`,
      language: 'html',
      autoRun: true,
      showLineNumbers: true,
      fontSize: 13,
      theme: 'dark',
      sandboxed: true,
    },
  },
];

export const TEMPLATE_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'ui-component', label: 'UI' },
  { key: 'chart', label: 'Charts' },
  { key: 'form', label: 'Forms' },
  { key: 'layout', label: 'Layout' },
  { key: 'art', label: 'Art' },
  { key: 'animation', label: 'Motion' },
];