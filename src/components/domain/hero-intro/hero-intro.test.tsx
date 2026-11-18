import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { HeroIntro } from './hero-intro';

describe('HeroIntro', () => {
  describe('given the intro is on stage', () => {
    it('when rendered, then the h1 reads the full name and the panel is marked active', async () => {
      // Given
      const { container } = renderWithProviders(
        <HeroIntro isActive isInert={false} />,
      );

      // When
      const heading = screen.getByRole('heading', { level: 1 });

      // Then
      expect(heading).toHaveAccessibleName('Marin Samardžić');
      expect(heading.parentElement).toHaveAttribute('data-active');
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('given the intro has left the stage', () => {
    it('when rendered, then it is inert and not marked active', () => {
      // Given / When
      renderWithProviders(<HeroIntro isActive={false} isInert />);

      // Then
      const panel = screen.getByRole('heading', {
        level: 1,
        hidden: true,
      }).parentElement;
      expect(panel).not.toHaveAttribute('data-active');
      expect(panel).toHaveAttribute('inert');
    });
  });

  describe('given the visitor wants to skip the walk-out', () => {
    it('when the skip link is used, then it jumps to the squad, and without a handler it is a plain #squad anchor', async () => {
      // Given
      const user = userEvent.setup();
      const onSkip = vi.fn();
      renderWithProviders(
        <HeroIntro isActive isInert={false} onSkip={onSkip} />,
      );

      // When
      const skip = screen.getByRole('link', { name: /Skip to the squad/ });
      await user.click(skip);

      // Then
      expect(onSkip).toHaveBeenCalledOnce();
      expect(skip).toHaveAttribute('href', '#squad');
    });
  });
});
