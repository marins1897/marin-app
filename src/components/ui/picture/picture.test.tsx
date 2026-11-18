import { render, screen } from '@testing-library/react';
import { buildPicturePreload } from './lib/build-picture-preload';
import { Picture, type PictureSource } from './picture';

const picture: PictureSource = {
  sources: {
    'image/avif': '/a-320.avif 320w, /a-640.avif 640w',
    'image/webp': '/a-320.webp 320w, /a-640.webp 640w',
  },
  img: { src: '/a-640.png', w: 640, h: 400 },
};

describe('Picture', () => {
  describe('given a below-the-fold image', () => {
    it('when rendered, then it lazy-loads, decodes async and keeps its aspect ratio', () => {
      // Given / When
      render(<Picture picture={picture} alt="A fish" />);

      // Then
      const img = screen.getByRole('img', { name: 'A fish' });
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
      expect(img).toHaveAttribute('width', '640');
      expect(img).toHaveAttribute('height', '400');
      expect(document.querySelectorAll('source')).toHaveLength(2);
    });
  });

  describe('given the LCP image', () => {
    it('when rendered with priority, then it loads eagerly with high fetch priority', () => {
      // Given / When
      render(<Picture picture={picture} alt="Hero" priority />);

      // Then
      const img = screen.getByRole('img', { name: 'Hero' });
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveAttribute('fetchpriority', 'high');
    });

    it('when a preload link is built, then it targets the first (best) source set', () => {
      // Given / When
      const link = buildPicturePreload(picture, '50vw');

      // Then
      expect(link).toEqual({
        rel: 'preload',
        as: 'image',
        href: '/a-640.png',
        imageSrcSet: '/a-320.avif 320w, /a-640.avif 640w',
        imageSizes: '50vw',
        type: 'image/avif',
        fetchPriority: 'high',
      });
    });
  });
});
