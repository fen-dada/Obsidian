import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(process.argv[2] ?? "_site");
const boardRoot = path.join(siteRoot, "板子");
const manifest = JSON.parse(fs.readFileSync(path.join(siteRoot, "manifest.json"), "utf8"));
const builtAt = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Hong_Kong", dateStyle: "medium", timeStyle: "short" }).format(new Date(manifest.built_at));

if (!fs.existsSync(boardRoot) || !fs.statSync(boardRoot).isDirectory()) {
  throw new Error(`PDF directory does not exist: ${boardRoot}`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function encodePath(parts) {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

function renderDirectory(directory, relativeParts = []) {
  const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) {
      return a.isDirectory() ? -1 : 1;
    }
    return a.name.localeCompare(b.name, "zh-CN");
  });

  const items = entries.map((entry) => {
    const childParts = [...relativeParts, entry.name];
    const childPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return `<li class="folder"><details open><summary>${escapeHtml(entry.name)}</summary>${renderDirectory(childPath, childParts)}</details></li>`;
    }

    if (!entry.isFile() || !entry.name.endsWith(".pdf")) {
      return "";
    }

    const href = encodePath(["板子", ...childParts]);
    return `<li class="file"><a href="${href}">${escapeHtml(entry.name)}</a></li>`;
  });

  return `<ul>${items.join("")}</ul>`;
}

const tree = renderDirectory(boardRoot);
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 9h18"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Zm0 0v6h6M8 13h8M8 17h5"/>',
  book: '<path d="M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2Z"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/>',
};
const icon = name => `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const navigation = [["/", "全部内容", "grid"], ["/projects/", "项目", "folder"], ["/essays/", "随笔", "file"], ["/fiction/", "小说", "book"], ["/Obsidian/", "算法板子", "code"]];
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>算法板子 - fen-dada</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/style.css">
  <script defer src="/board-sidebar.js"></script>
  <style>
    .board-page h1 { margin-bottom: 0.25rem; }
    .board-page p { color: var(--muted, #737984); margin-top: 0; }
    .board-page ul { list-style: none; margin: 0.3rem 0 0.3rem 0.9rem; padding-left: 0.8rem; border-left: 1px solid #e9ebef; }
    .board-page li { margin: 0.25rem 0; }
    .board-page summary { cursor: pointer; font-weight: 550; }
    .board-page a { color: var(--blue, #3666d6); text-decoration: none; overflow-wrap: anywhere; }
    .board-page a:hover { text-decoration: underline; }
    .downloads { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0; }
    .downloads a { border: 1px solid #2878c8; border-radius: 6px; padding: 10px 16px; }
    .file::before { content: "PDF"; display: inline-block; margin-right: 0.55rem; padding: 0.05rem 0.3rem; border-radius: 0.25rem; background: #d33; color: white; font-size: 0.68rem; font-weight: 700; }
  </style>
</head>
<body>
  <a class="skip-link" href="#main">跳到正文</a>
  <div class="site-layout">
    <aside class="sidebar">
      <a class="site-name" href="/" aria-label="fen-dada 首页"><span class="site-mark" aria-hidden="true">fd</span><span>fen-dada<small>个人记录</small></span></a>
      <p class="nav-label">内容</p>
      <nav aria-label="主导航">${navigation.map(([href, label, symbol]) => `<a href="${href}"${href === "/Obsidian/" ? ' aria-current="page"' : ""}>${icon(symbol)}<span>${label}</span></a>`).join("")}</nav>
      <div class="sidebar-bottom"><a href="https://github.com/fen-dada">${icon("arrow")}<span>GitHub</span></a><a href="/admin/">${icon("settings")}<span>管理</span></a></div>
    </aside>
    <div class="workspace">
      <header class="topbar"><nav class="breadcrumb" aria-label="当前位置"><a href="/">fen-dada</a><span aria-hidden="true">/</span><span>算法板子</span></nav><a class="upload-button" href="/">返回主页</a></header>
      <main id="main" class="board-page">
  <h1>算法板子 PDF</h1>
  <p>共 ${manifest.notes} 篇 · 合集 ${manifest.pages} 页 · A4 纵向 · 代码彩色高亮 · 代码自动换行</p>
  <div class="downloads">
    <a href="board-all.pdf">打开整本 PDF（含打印目录）</a>
    <a href="board-all.pdf" download="算法板子-打印合集.pdf">下载整本 PDF</a>
    <a href="board-pdfs.zip" download>下载全部 PDF 压缩包</a>
  </div>
  <p>打印时选择 A4、实际大小（100%）。需要双面打印时选择长边翻转。目录页码对应 PDF 页码。</p>
  <p>生成时间（香港时间）：${escapeHtml(builtAt)}</p>
  <p>目录和文件名与仓库中的“板子”文件夹保持一致。点击文件即可打开或下载最新 PDF。</p>
  ${tree}
      </main>
      <footer><span>fen-dada</span><span>个人记录</span><a href="/">返回主页</a></footer>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(siteRoot, "index.html"), html, "utf8");
