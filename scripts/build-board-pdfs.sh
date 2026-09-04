#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_root="$repo_root/板子"
site_root="$repo_root/_site"
header_file="$repo_root/scripts/pdf-header.tex"
temporary_root="$(mktemp -d)"
trap 'rm -rf -- "$temporary_root"' EXIT

if [[ ! -d "$source_root" ]]; then
  echo "Missing source directory: $source_root" >&2
  exit 1
fi

if [[ "$site_root" != "$repo_root/_site" || "$site_root" == "$repo_root" || "$site_root" == "/" ]]; then
  echo "Refusing to clean unsafe output path: $site_root" >&2
  exit 1
fi

for command_name in pandoc xelatex node; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command is unavailable: $command_name" >&2
    exit 1
  fi
done

# The Pages artifact is rebuilt from scratch. Removed or renamed Markdown files
# therefore cannot leave stale PDFs in the next deployment.
rm -rf -- "$site_root"
mkdir -p "$site_root/板子"
touch "$site_root/.nojekyll"

pdf_count=0
while IFS= read -r -d '' markdown_file; do
  relative_path="${markdown_file#"$source_root"/}"
  relative_pdf="${relative_path%.md}.pdf"
  output_pdf="$site_root/板子/$relative_pdf"
  prepared_markdown="$temporary_root/$relative_path"

  mkdir -p "$(dirname "$output_pdf")"
  mkdir -p "$(dirname "$prepared_markdown")"
  conversion_log="$(mktemp)"
  echo "Converting: $relative_path"

  node "$repo_root/scripts/prepare-markdown.mjs" "$markdown_file" "$prepared_markdown"

  if ! pandoc "$prepared_markdown" \
      --from="markdown+tex_math_dollars+raw_tex+fenced_code_attributes" \
      --pdf-engine=xelatex \
      --resource-path="$(dirname "$markdown_file"):$source_root:$repo_root" \
      --syntax-highlighting=tango \
      --include-in-header="$header_file" \
      --metadata=lang:zh-CN \
      -V papersize:a4 \
      -V fontsize:10pt \
      -V geometry:margin=1.45cm \
      -V mainfont="Noto Serif CJK SC" \
      -V sansfont="Noto Sans CJK SC" \
      -V monofont="Noto Sans Mono CJK SC" \
      -V CJKmainfont="Noto Serif CJK SC" \
      -o "$output_pdf" >"$conversion_log" 2>&1; then
    error_summary="$(tail -n 20 "$conversion_log" | tr '\n' ' ' | cut -c1-1800)"
    error_summary="${error_summary//'%'/'%25'}"
    echo "::error title=PDF conversion failed,file=板子/$relative_path::$error_summary"
    cat "$conversion_log" >&2
    rm -f -- "$conversion_log"
    exit 1
  fi

  rm -f -- "$conversion_log"

  pdf_count=$((pdf_count + 1))
done < <(find "$source_root" -type f -name '*.md' -print0)

if [[ "$pdf_count" -eq 0 ]]; then
  echo "No Markdown files found under $source_root" >&2
  exit 1
fi

node "$repo_root/scripts/generate-board-index.mjs" "$site_root"
echo "Generated $pdf_count PDFs under $site_root/板子"
