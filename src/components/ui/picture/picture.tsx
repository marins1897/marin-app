import { cx } from '../lib/cx';
import styles from './picture.module.scss';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * Responsive image description: one srcset per MIME type plus a fallback
 * `<img>`. Matches the output of vite-imagetools' `as=picture` directive, but
 * the component itself has no build-tool dependency.
 */
export interface PictureSource {
  /** MIME type → comma-separated srcset, e.g. `{ 'image/avif': '/a-320.avif 320w, …' }` */
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}

export interface PictureProps extends Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'srcSet' | 'width' | 'height' | 'alt'
> {
  /** e.g. the default export of `import img from './x.png?picture'`. */
  picture: PictureSource;
  /** Required. Use `""` only for purely decorative images. */
  alt: string;
  /** `sizes` attribute; defaults to the full viewport width. */
  sizes?: string;
  /**
   * True for the LCP image only: eager, high fetch priority. Everything else
   * is lazy and decoded asynchronously.
   */
  priority?: boolean;
  pictureClassName?: string;
}

/** Responsive `<picture>` that makes the right performance defaults automatic. */
export const Picture = ({
  picture,
  alt,
  sizes = '100vw',
  priority = false,
  className,
  pictureClassName,
  ...rest
}: PictureProps) => {
  const { img, sources } = picture;
  return (
    <picture className={cx(styles.picture, pictureClassName)}>
      {Object.entries(sources).map(([type, srcSet]) => (
        <source key={type} type={type} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={img.src}
        width={img.w}
        height={img.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={cx(styles.img, className)}
        {...rest}
      />
    </picture>
  );
};
