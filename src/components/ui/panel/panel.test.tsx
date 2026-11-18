import { render, screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { Panel } from './panel';

describe('Panel', () => {
  describe('given a labelled, textured section panel with a left edge', () => {
    it('when rendered, then it keeps its element, label, edge and extra class', async () => {
      // Given
      const { container } = render(
        <Panel
          as="section"
          aria-label="Player card"
          edge="left"
          isTextured
          className="extra"
        >
          <p>Content</p>
        </Panel>,
      );

      // When
      const panel = screen.getByRole('region', { name: 'Player card' });

      // Then
      expect(panel).toHaveClass('extra');
      expect(panel.className).toMatch(/left/);
      expect(panel.className).toMatch(/textured/);
      expect(panel).toHaveTextContent('Content');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
