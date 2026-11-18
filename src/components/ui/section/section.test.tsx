import { render, screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { Section } from './section';

describe('Section', () => {
  describe('given a title and children', () => {
    it('when rendered, then a region labelled by its heading wraps the content', async () => {
      // Given
      const { container } = render(
        <Section
          id="faq"
          title="Questions"
          eyebrow="Help"
          description="Answers below"
        >
          <p>Body</p>
        </Section>,
      );

      // When
      const region = screen.getByRole('region', { name: 'Questions' });

      // Then
      expect(
        screen.getByRole('heading', { level: 2, name: 'Questions' }),
      ).toHaveAttribute('id', 'faq-heading');
      expect(region).toContainElement(screen.getByText('Body'));
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('given a heading level of 3', () => {
    it('when rendered, then the heading is an h3', () => {
      // Given / When
      render(
        <Section id="sub" title="Sub" headingLevel={3}>
          <p>Body</p>
        </Section>,
      );

      // Then
      expect(
        screen.getByRole('heading', { level: 3, name: 'Sub' }),
      ).toBeInTheDocument();
    });
  });
});
