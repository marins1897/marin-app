import { screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { FullTimePanel } from './full-time-panel';

describe('FullTimePanel', () => {
  describe('given the contact chapter is on stage', () => {
    it('when rendered, then it offers email and social links with the address readable as text', async () => {
      // Given
      const { container } = renderWithProviders(
        <FullTimePanel isActive isInert={false} />,
      );

      // When
      const email = screen.getByRole('link', { name: 'Email me' });

      // Then
      expect(email).toHaveAttribute(
        'href',
        'mailto:marinsamardzic17@gmail.com',
      );
      expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
        'rel',
        'noopener noreferrer',
      );
      expect(
        screen.getByText('marinsamardzic17@gmail.com'),
      ).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
