import { screen, within } from '@testing-library/react';
import { career } from '@/content/profile';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { CoachProfile } from './coach-profile';

describe('CoachProfile', () => {
  describe('given the home page', () => {
    it('when rendered, then about, the full career newest first and the skill groups are readable as plain text', async () => {
      // Given
      const { container } = renderWithProviders(<CoachProfile />);

      // When
      const section = screen.getByRole('region', { name: 'About me' });
      const moves = within(section).getAllByRole('heading', { level: 4 });

      // Then
      expect(
        within(section).getByText(/fullstack developer from Sinj/),
      ).toBeInTheDocument();
      expect(
        within(section).getByText('07/2025 – Present'),
      ).toBeInTheDocument();
      expect(moves.slice(0, career.length).map((h) => h.textContent)).toEqual([
        'PufferFullstack Blockchain Developer',
        'ReneVerseFullstack Blockchain Developer',
        'CryptoTodayBackend Developer',
        'CS Computer SystemsFrontend Blockchain Developer',
        'MPS DataFootball Analyst',
      ]);
      expect(
        within(section).getByRole('list', { name: 'Web3' }),
      ).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
