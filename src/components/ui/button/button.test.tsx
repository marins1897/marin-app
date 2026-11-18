import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from '@/test/axe';
import { Button } from './button';

describe('Button', () => {
  describe('given a button with an action', () => {
    it('when activated with mouse and keyboard, then the action runs and it is a non-submitting button', async () => {
      // Given
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = render(<Button onPress={onClick}>Accept</Button>);
      const button = screen.getByRole('button', { name: 'Accept' });

      // When
      await user.click(button);
      button.focus();
      await user.keyboard('{Enter}');

      // Then
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(button).toHaveAttribute('type', 'button');
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('given a disabled button', () => {
    it('when clicked, then nothing happens', async () => {
      // Given
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button onPress={onClick} isDisabled>
          Decline
        </Button>,
      );

      // When
      await user.click(screen.getByRole('button', { name: 'Decline' }));

      // Then
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
