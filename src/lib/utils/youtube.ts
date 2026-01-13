/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param url - YouTube URL (watch, youtu.be, embed, etc.)
 * @returns YouTube video ID or null if invalid
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Remove whitespace
  url = url.trim();

  // Pattern for youtube.com/watch?v=VIDEO_ID
  const watchPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(watchPattern);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Converts YouTube URL to embed URL
 * @param url - YouTube URL
 * @returns Embed URL or original URL if invalid
 */
export function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}
