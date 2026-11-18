import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { ChapterRail } from './chapter-rail';

const renderRail = (onSelect = vi.fn()) =>
  renderWithProviders(
    <ChapterRail
      chapters={['tunnel', 'intros'] as const}
      current="intros"
      labelKey={(chapter) => `chapters.${chapter}`}
      onSelect={onSelect}
    />,
  );

describe('ChapterRail', () => {
  describe('given the visitor is in the players chapter', () => {
    it('when rendered, then only that step is marked current', async () => {
      // Given
      const { container } = renderRail();

      // When
      const steps = within(
        screen.getByRole('navigation', { name: 'Chapters' }),
      ).getAllByRole('button');

      // Then
      expect(steps[0]).not.toHaveAttribute('aria-current');
      expect(steps[1]).toHaveAttribute('aria-current', 'step');
      expect(steps[1]).toHaveTextContent('Players');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('when a step is clicked, then the rail asks to jump to that chapter', async () => {
      // Given
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderRail(onSelect);

      // When
      await user.click(screen.getByRole('button', { name: 'Tunnel' }));

      // Then
      expect(onSelect).toHaveBeenCalledWith('tunnel');
    });
  });
});
