import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  throw new Error("Usage: node prepare-markdown.mjs INPUT.md OUTPUT.md");
}

const input = fs.readFileSync(inputPath, "utf8");
const newline = input.includes("\r\n") ? "\r\n" : "\n";
const lines = input.split(/\r?\n/);
const output = [];

let displayMath = false;
let fenceMarker = null;

for (const line of lines) {
  const trimmed = line.trim();
  const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);

  if (fenceMatch) {
    const marker = fenceMatch[1][0];
    if (fenceMarker === null) {
      fenceMarker = marker;
    } else if (fenceMarker === marker) {
      fenceMarker = null;
    }
    output.push(line);
    continue;
  }

  if (fenceMarker === null && trimmed === "$$") {
    displayMath = !displayMath;
    output.push(line);
    continue;
  }

  // Obsidian's MathJax accepts blank lines inside $$ blocks. Pandoc does not,
  // so normalize only the temporary build copy and leave the vault untouched.
  if (displayMath && trimmed === "") {
    continue;
  }

  if (fenceMarker === null && !displayMath) {
    output.push(line.replaceAll("\\(", "$").replaceAll("\\)", "$"));
  } else {
    output.push(line);
  }
}

if (displayMath) {
  throw new Error(`Unclosed display-math block in ${inputPath}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output.join(newline), "utf8");
