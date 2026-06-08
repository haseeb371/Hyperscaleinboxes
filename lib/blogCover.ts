const DEFAULT_COVER = '/globe.svg';

export function getBlogCoverSrc(image?: string | null) {
  const src = image?.trim();
  return src || DEFAULT_COVER;
}

/** Icons/SVGs should fit inside the frame; photos fill the banner. */
export function shouldContainCoverImage(src: string) {
  const lower = src.toLowerCase();
  return (
    lower.endsWith('.svg') ||
    lower.includes('globe.svg') ||
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('placeholder')
  );
}
