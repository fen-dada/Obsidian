"""Verify every note, add a printable contents page, merge, and archive PDFs."""
import json
import io
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas


def build(repo):
    site = repo / "_site"
    source = repo / "板子"
    notes = sorted(p for p in source.rglob("*") if p.is_file() and p.suffix.lower() == ".md")
    expected = {p.relative_to(source).with_suffix(".pdf") for p in notes}
    actual = {p.relative_to(site / "板子") for p in (site / "板子").rglob("*.pdf")}
    if not notes or expected != actual:
        raise RuntimeError(f"Markdown/PDF mismatch: missing={expected-actual}, extra={actual-expected}")

    entries = []
    for note in notes:
        relative = note.relative_to(source).with_suffix(".pdf")
        pdf = site / "板子" / relative
        reader = PdfReader(pdf, strict=True)
        if not reader.pages or not any((p.extract_text() or "").strip() for p in reader.pages):
            raise RuntimeError(f"Empty or unreadable PDF: {pdf}")
        for page in reader.pages:
            if abs(float(page.mediabox.width) - 595.28) > 2 or abs(float(page.mediabox.height) - 841.89) > 2:
                raise RuntimeError(f"Expected portrait A4: {pdf}")
        entries.append({"path": "板子/" + relative.as_posix(), "title": relative.with_suffix("").as_posix(), "pages": len(reader.pages)})

    with tempfile.TemporaryDirectory() as temporary:
        toc_md = Path(temporary) / "contents.md"
        toc_pdf = Path(temporary) / "contents.pdf"

        def render_contents(offset):
            lines = ["共 %d 篇，A4 纵向。下表页码为整本 PDF 的实际页码。" % len(entries), "", "| 算法 | 起始页 |", "|:---|---:|"]
            page = offset + 1
            for entry in entries:
                title = entry["title"].replace("`", "").replace("|", "\\|")
                lines.append(f"| `{title}` | {page} |")
                page += entry["pages"]
            toc_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
            subprocess.run(["pandoc", str(toc_md), f"--defaults={repo / 'scripts/board-pdf.yaml'}", f"--include-in-header={repo / 'scripts/pdf-header.tex'}", "--metadata=title:算法板子 · 打印目录", "-o", str(toc_pdf)], check=True)
            return len(PdfReader(toc_pdf).pages)

        offset = 0
        for _ in range(4):
            count = render_contents(offset)
            if count == offset:
                break
            offset = count
        else:
            raise RuntimeError("Contents pagination did not stabilize")

        writer = PdfWriter()
        writer.append(str(toc_pdf), import_outline=False)
        writer.add_outline_item("打印目录", 0)
        page = offset
        for entry in entries:
            entry["start_page"] = page + 1
            writer.append(str(site / entry["path"]), outline_item=entry["title"], import_outline=False)
            page += entry["pages"]
        # Replace each chapter's local footer with continuous printed page numbers.
        total = len(writer.pages)
        for number, pdf_page in enumerate(writer.pages, 1):
            width = float(pdf_page.mediabox.width)
            height = float(pdf_page.mediabox.height)
            overlay = io.BytesIO()
            stamp = canvas.Canvas(overlay, pagesize=(width, height))
            stamp.setFillColorRGB(1, 1, 1)
            stamp.rect(width / 2 - 55, 2, 110, 27, fill=1, stroke=0)
            stamp.setFillColorRGB(0.25, 0.25, 0.25)
            stamp.setFont("Helvetica", 9)
            stamp.drawCentredString(width / 2, 15, f"{number} / {total}")
            stamp.save()
            overlay.seek(0)
            pdf_page.merge_page(PdfReader(overlay).pages[0])
        writer.add_metadata({"/Title": "算法板子（打印合集）", "/Author": ""})
        writer.write(str(site / "board-all.pdf"))
        writer.close()

    total = sum(entry["pages"] for entry in entries) + offset
    merged = PdfReader(site / "board-all.pdf", strict=True)
    if len(merged.pages) != total:
        raise RuntimeError("Merged PDF page count mismatch")
    manifest = {"built_at": datetime.now(timezone.utc).isoformat(), "notes": len(entries), "pages": total, "contents_pages": offset, "files": entries}
    (site / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with zipfile.ZipFile(site / "board-pdfs.zip", "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for entry in entries:
            archive.write(site / entry["path"], entry["path"])
        archive.write(site / "board-all.pdf", "算法板子-打印合集.pdf")
        archive.write(site / "manifest.json", "manifest.json")
    print(f"Verified {len(entries)} PDFs; combined print book: {total} pages (contents: {offset}).")


if __name__ == "__main__":
    build(Path(sys.argv[1]).resolve())
