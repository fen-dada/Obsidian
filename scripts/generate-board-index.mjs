import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(process.argv[2] ?? "_site");
const boardRoot = path.join(siteRoot, "板子");

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
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>算法板子 PDF</title>
  <style>
    :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans CJK SC", sans-serif; }
    body { max-width: 920px; margin: 0 auto; padding: 32px 20px 64px; line-height: 1.65; }
    h1 { margin-bottom: 0.25rem; }
    p { color: #777; margin-top: 0; }
    ul { list-style: none; margin: 0.3rem 0 0.3rem 0.9rem; padding-left: 0.8rem; border-left: 1px solid #9995; }
    li { margin: 0.25rem 0; }
    summary { cursor: pointer; font-weight: 650; }
    a { color: #2878c8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .file::before { content: "PDF"; display: inline-block; margin-right: 0.55rem; padding: 0.05rem 0.3rem; border-radius: 0.25rem; background: #d33; color: white; font-size: 0.68rem; font-weight: 700; }
  </style>
</head>
<body>
  <h1>算法板子 PDF</h1>
  <p>目录和文件名与仓库中的“板子”文件夹保持一致。点击文件即可打开或下载最新 PDF。</p>
  ${tree}
</body>
</html>
`;

fs.writeFileSync(path.join(siteRoot, "index.html"), html, "utf8");
