import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { TunnelBackdrop } from './tunnel-backdrop';

describe('TunnelBackdrop', () => {
  describe('given the 3D scene is still loading', () => {
    it('when rendered, then a decorative tunnel with its ceiling lamps is drawn and marked as loading', async () => {
      // Given / When
      const { container } = renderWithProviders(<TunnelBackdrop isLoading />);
      const drawing = container.querySelector('svg');

      // Then
      expect(drawing).toHaveAttribute('aria-hidden', 'true');
      expect(drawing).toHaveAttribute('data-loading');
      expect(drawing?.querySelectorAll('rect[style]')).toHaveLength(7);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('given loading has finished or failed', () => {
    it('when rendered, then the lamps stay on without the loading animation', () => {
      // Given / When
      const { container } = renderWithProviders(
        <TunnelBackdrop isLoading={false} />,
      );

      // Then
      expect(container.querySelector('svg')).not.toHaveAttribute(
        'data-loading',
      );
    });
  });
});
