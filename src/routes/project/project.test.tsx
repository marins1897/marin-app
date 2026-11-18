import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import ProjectPage, { meta } from './project';

type MetaArgs = Parameters<typeof meta>[0];

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/projects/:slug" element={<ProjectPage />} />
    </Routes>,
    { route: path },
  );

describe('project route', () => {
  describe('given the captain', () => {
    it('when rendered, then the scout report shows the project, its position and the neighbouring players', async () => {
      // Given / When
      const { container } = renderAt('/projects/nk-osk-otok');

      // Then
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '#10 NK OSK Otok',
      );
      expect(screen.getByText('Why central midfield:')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /9 · puffer\.fi/ }),
      ).toHaveAttribute('href', '/projects/puffer-fi');
      expect(
        screen.getByRole('link', { name: /11 · This portfolio/ }),
      ).toHaveAttribute('href', '/projects/this-portfolio');
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('given an unknown player', () => {
    it('when rendered, then the not-found page is shown and meta is empty', () => {
      // Given / When
      renderAt('/projects/nobody');

      // Then
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Offside!',
      );
      expect(meta({ params: { slug: 'nobody' } } as MetaArgs)).toEqual([]);
    });
  });

  describe('given a known player', () => {
    it('when meta is built, then it carries the title, position and the canonical link', () => {
      // Given / When
      const descriptors = meta({
        params: { slug: 'e-sljedivost' },
      } as MetaArgs);

      // Then
      expect(descriptors).toContainEqual({
        title: 'e-Sljedivost · #1 GK | Marin Samardžić',
      });
      expect(descriptors).toContainEqual({
        tagName: 'link',
        rel: 'canonical',
        href: 'https://marin-iota.vercel.app/projects/e-sljedivost',
      });
    });
  });
});
