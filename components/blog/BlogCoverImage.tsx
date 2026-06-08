import { getBlogCoverSrc } from '@/lib/blogCover';

type BlogCoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  variant?: 'banner' | 'split';
};

export default function BlogCoverImage({
  src,
  alt,
  className = '',
  variant = 'banner',
}: BlogCoverImageProps) {
  const imageSrc = getBlogCoverSrc(src);

  if (variant === 'split') {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={`max-h-[300px] w-full rounded-2xl object-contain object-center sm:max-h-[340px] ${className}`}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`max-h-[200px] w-full rounded-xl object-contain object-center sm:max-h-[220px] ${className}`}
    />
  );
}
