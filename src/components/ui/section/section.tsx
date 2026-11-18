import { cx } from '../lib/cx';
import { Container } from '../container';
import styles from './section.module.scss';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface SectionProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Unique id; also derives the heading id used by `aria-labelledby`. */
  id: string;
  /** Rendered heading content. */
  title: ReactNode;
  headingLevel?: 2 | 3;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** `muted` alternates background between stacked sections. */
  tone?: 'default' | 'muted';
  contentClassName?: string;
  children: ReactNode;
}

/** Page section with a heading, exposed as a labelled `region`. */
export const Section = ({
  id,
  title,
  headingLevel = 2,
  eyebrow,
  description,
  tone = 'default',
  className,
  contentClassName,
  children,
  ...rest
}: SectionProps) => {
  const headingId = `${id}-heading`;
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cx(
        styles.section,
        tone === 'muted' && styles.muted,
        className,
      )}
      {...rest}
    >
      <Container>
        <header className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <Heading id={headingId} className={styles.title}>
            {title}
          </Heading>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>
        <div className={contentClassName}>{children}</div>
      </Container>
    </section>
  );
};
