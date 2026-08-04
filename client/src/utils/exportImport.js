// Simple HTML to Markdown converter
export function htmlToMarkdown(html) {
  if (!html) return "";
  let md = html;
  // Replace Headings
  md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n");
  // Replace Bold, Italic, Underline, Strike
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<u>(.*?)<\/u>/gi, "<ins>$1</ins>");
  md = md.replace(/<s>(.*?)<\/s>/gi, "~~$1~~");
  md = md.replace(/<strike>(.*?)<\/strike>/gi, "~~$1~~");
  // Replace Links
  md = md.replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)");
  // Replace Lists
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, p1) => {
    return p1.replace(/<li>(.*?)<\/li>/gi, "- $1\n") + "\n";
  });
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/gi, (match, p1) => {
    let index = 1;
    return p1.replace(/<li>(.*?)<\/li>/gi, () => `${index++}. $1\n`) + "\n";
  });
  // Replace Paragraphs & Blockquotes
  md = md.replace(/<blockquote>(.*?)<\/blockquote>/gi, "> $1\n\n");
  md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, "");
  return md.trim();
}

// Simple Markdown to HTML converter
export function markdownToHtml(md) {
  if (!md) return "";
  let html = md;
  // Escape HTML tags to prevent XSS
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Headings
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "2>$1</h2>").replace(/^2>/g, "<h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  // Bold, Italic, Strikethrough
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, "<blockquote>$1</blockquote>");
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  // Lists
  html = html.replace(/^\- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gim, "<ul>$1</ul>");
  // Paragraphs
  const lines = html.split("\n\n");
  html = lines.map(line => {
    if (line.startsWith("<h") || line.startsWith("<ul") || line.startsWith("<blockquote")) return line;
    return `<p>${line.replace(/\n/g, "<br/>")}</p>`;
  }).join("");

  return html;
}

// Trigger file download in browser
export function downloadFile(filename, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(title, html) {
  const md = htmlToMarkdown(html);
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
  downloadFile(filename, md, "text/markdown;charset=utf-8");
}

export function exportAsHtml(title, html) {
  const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    h1, h2, h3 { margin-top: 1.5em; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #64748b; }
    a { color: #6366f1; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${html}
</body>
</html>`;
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
  downloadFile(filename, fullDoc, "text/html;charset=utf-8");
}
