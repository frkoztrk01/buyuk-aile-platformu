import { renderContentHtml } from '@/lib/utils/markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
  dropCap?: boolean;
}

export default function MarkdownContent({
  content,
  className = '',
  dropCap = false,
}: MarkdownContentProps) {
  if (!content) return null;

  const classes = ['markdown-content', dropCap ? 'markdown-drop-cap' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      dangerouslySetInnerHTML={{ __html: renderContentHtml(content) }}
    />
  );
}
