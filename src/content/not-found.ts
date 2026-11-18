import type { PageSeo } from '../seo/page-meta';

export const notFoundContent: { seo: PageSeo } = {
  seo: {
    title: 'Offside: page not found',
    description:
      'This page does not exist or has moved. Head back to the squad.',
    noindex: true,
  },
};
