import { act, render, screen } from '@testing-library/react';
import { intersectAll } from '@/test/intersection-observer';
import { LazySection, type LazyLoader } from './lazy-section';

interface GreetingProps {
  name: string;
}
const Greeting = ({ name }: GreetingProps) => <p>Hello {name}</p>;

describe('LazySection', () => {
  describe('given a section outside the viewport on the client', () => {
    it('when rendered, then the chunk is not requested and nothing is mounted', () => {
      // Given
      const load = vi.fn<LazyLoader<GreetingProps>>(() =>
        Promise.resolve({ Component: Greeting }),
      );

      // When
      render(
        <LazySection
          load={load}
          componentProps={{ name: 'Ada' }}
          minHeight="10rem"
        />,
      );

      // Then
      expect(load).not.toHaveBeenCalled();
      expect(screen.queryByText('Hello Ada')).not.toBeInTheDocument();
    });

    it('when it scrolls into view, then the chunk loads once and the component mounts', async () => {
      // Given
      const load = vi.fn<LazyLoader<GreetingProps>>(() =>
        Promise.resolve({ Component: Greeting }),
      );
      render(<LazySection load={load} componentProps={{ name: 'Ada' }} />);

      // When
      await act(async () => {
        intersectAll();
      });

      // Then
      expect(await screen.findByText('Hello Ada')).toBeInTheDocument();
      expect(load).toHaveBeenCalledTimes(1);
    });
  });
});
