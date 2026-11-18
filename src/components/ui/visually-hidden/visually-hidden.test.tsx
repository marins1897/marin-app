import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from './visually-hidden';

describe('VisuallyHidden', () => {
  describe('given hidden helper text', () => {
    it('when rendered, then it is in the accessibility tree but visually clipped', () => {
      // Given / When
      render(<VisuallyHidden>opens in a new tab</VisuallyHidden>);

      // Then
      const text = screen.getByText('opens in a new tab');
      expect(text).toBeInTheDocument();
      expect(text).toHaveClass('visuallyHidden');
    });
  });
});
