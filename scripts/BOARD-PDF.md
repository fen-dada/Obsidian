# 板子 PDF 自动打印版

下载入口：https://fen-dada.github.io/Obsidian/

只转换 `板子/` 中的 Markdown，不读取 `algorithm-template/`，不修改两边笔记。
保留目录结构；空笔记生成标题页，避免漏文件。代码使用 Tango 彩色语法高亮并自动换行，公式用 XeLaTeX 排版，中文字体嵌入 PDF。

同步 `板子/` 到 GitHub `main` 后，Actions 自动重新构建。也可在 Actions 中选择 **Build and deploy board PDFs → Run workflow** 手动生成。

- `board-all.pdf`：整本合集，含纸质目录、连续页码及 PDF 书签，适合一次打印。
- `board-pdfs.zip`：全部单篇 PDF 及合集，适合备份或交给打印店。
- `板子/分类/名称.pdf`：与原笔记逐篇对应。
- `manifest.json`：篇数、页数和生成时间。

网站保存最近一次成功部署的版本。Actions 的 `board-pdfs` 附件另存一份，保留 30 天；即使 Pages 部署失败，也能在成功的构建任务中下载。首次使用需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

打印建议：A4、实际大小 100%；双面选择长边翻转。目录中的页码是合集实际 PDF 页码，单篇文档保留自身页码。

构建在 Ubuntu 24.04 上使用 apt 的 Pandoc / TeX Live，避免 `tlmgr` 的跨年度版本和镜像问题。依赖：`pandoc texlive-xetex texlive-lang-chinese texlive-latex-extra texlive-fonts-recommended lmodern fonts-noto-cjk poppler-utils python3-pypdf python3-reportlab`，以及 Node.js。

在仓库根目录运行：`bash scripts/build-board-pdfs.sh`。生成目录 `_site/` 已被 Git 忽略；PDF 不提交回笔记仓库，避免云同步重复增大仓库。
