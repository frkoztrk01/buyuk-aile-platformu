function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text: string): string {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" class="markdown-image" />'
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  return html;
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('```') ||
    /^#{1,4}\s/.test(trimmed) ||
    /^[*-]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed) ||
    /^>\s?/.test(trimmed)
  );
}

/**
 * Markdown metnini HTML'e dönüştürür.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      const fence = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(headerMatch[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(`<blockquote><p>${inlineMarkdown(quoteLines.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^[*-]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[*-]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^[*-]\s+/, ''))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(
          `<li>${inlineMarkdown(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`
        );
        i += 1;
      }
      blocks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (!trimmed) {
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraphLines.push(lines[i]);
      i += 1;
    }
    blocks.push(`<p>${inlineMarkdown(paragraphLines.join('\n')).replace(/\n/g, '<br />')}</p>`);
  }

  return blocks.join('\n');
}

/**
 * Arama, sıralama ve filtreleme için markdown sözdizimini kaldırır.
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/^#{1,4}\s+/gm, '');
  text = text.replace(/^[*-]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  text = text.replace(/^>\s?/gm, '');
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  return text.replace(/\s+/g, ' ').trim();
}

/** WordPress'ten gelen HTML içerikleri ayırt etmek için. */
export function looksLikeHtml(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  return /<\/?[a-z][\s\S]*>/i.test(trimmed);
}

/** Markdown veya mevcut HTML içeriği görüntüleme için HTML'e dönüştürür. */
export function renderContentHtml(content: string): string {
  if (!content) return '';
  return looksLikeHtml(content) ? content : markdownToHtml(content);
}

/** Özet ve liste görünümleri için düz metin üretir. */
export function renderContentPlainText(content: string): string {
  if (!content) return '';
  if (looksLikeHtml(content)) {
    return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
  return markdownToPlainText(content);
}
