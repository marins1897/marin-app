import type { PictureSource } from '../picture';

/** `<link rel="preload">` descriptor for the LCP image (for a route's `links` export). */
export const buildPicturePreload = (
  picture: PictureSource,
  sizes = '100vw',
) => {
  const [preferredType, srcSet] = Object.entries(picture.sources)[0] ?? [];
  return {
    rel: 'preload' as const,
    as: 'image' as const,
    href: picture.img.src,
    ...(srcSet
      ? { imageSrcSet: srcSet, imageSizes: sizes, type: preferredType }
      : {}),
    fetchPriority: 'high' as const,
  };
};
