import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-with-providers';
import { StadiumScene } from './stadium-scene';
import type { StadiumCopy } from './lib/create-stadium';

const copy: StadiumCopy = {
  welcome: { kicker: 'Matchday', title: 'Welcome' },
  name: { kicker: '#10', firstName: 'Marin', lastName: 'Samardžić' },
  board: 'MARIN',
  wall: 'This is matchday',
  lineup: { kicker: 'Matchday', title: 'Starting XI', board: 'XI' },
  players: [],
};

describe('StadiumScene', () => {
  describe('given a browser without WebGL (jsdom)', () => {
    it('when the scene tries to start, then it reports that 3D is unavailable instead of failing', async () => {
      // Given
      const progressRef = { current: 0 };

      // When
      renderWithProviders(
        <StadiumScene
          progressRef={progressRef}
          focus={{ kind: 'welcome' }}
          copy={copy}
        />,
      );

      // Then
      expect(screen.getByRole('status')).toHaveTextContent('Floodlights on…');
      expect(
        await screen.findByText(
          /The 3D stadium needs a graphics card/,
          undefined,
          {
            timeout: 5000,
          },
        ),
      ).toBeInTheDocument();
    });
  });
});
