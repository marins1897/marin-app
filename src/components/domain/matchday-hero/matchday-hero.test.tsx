import { screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { MatchdayHero } from './matchday-hero';

describe('MatchdayHero', () => {
  describe('given the page has just loaded at the top', () => {
    it('when rendered, then the whole story is in the document and only the intro is on stage', async () => {
      // Given
      const { container } = renderWithProviders(<MatchdayHero />);

      // When
      const heading = screen.getByRole('heading', { level: 1 });

      // Then
      expect(heading).toHaveAccessibleName('Marin Samardžić');
      expect(heading.parentElement).toHaveAttribute('data-active');
      expect(
        screen.getByRole('region', { name: 'Coach card', hidden: true }),
      ).not.toHaveAttribute('data-active');
      expect(
        screen.getByRole('region', { name: 'Starting XI', hidden: true }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'The squad',
          hidden: true,
        }),
      ).toBeInTheDocument();
      const rail = screen.getByRole('navigation', { name: 'Chapters' });
      expect(within(rail).getByText('Tunnel')).toHaveAttribute(
        'aria-current',
        'step',
      );
      expect(await axe(container)).toHaveNoViolations();
    }, 30_000); // axe over the whole story, plus the lazy three.js import
  });
});
