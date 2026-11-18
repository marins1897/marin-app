import { useTranslation } from 'react-i18next';
import { ChipList } from '@/components/ui/chip-list';
import { Container } from '@/components/ui/container';
import { Tag } from '@/components/ui/tag';
import { career, skillGroups } from '@/content/profile';
import { cx } from '@/utils/class-names';
import styles from './coach-profile.module.scss';

export interface CoachProfileProps {
  className?: string;
}

const FACTS = ['based', 'experience', 'education'] as const;

/**
 * The plain-text profile under the stadium: about, career and skills. The
 * fast read for recruiters, and what search engines and link previews see.
 */
export const CoachProfile = ({ className }: CoachProfileProps) => {
  const { t } = useTranslation('profile');
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <section
      id="profile"
      aria-labelledby="profile-title"
      className={cx(styles.profile, className)}
    >
      <Container>
        <Tag>{t('kicker')}</Tag>
        <h2 id="profile-title" className={styles.title}>
          {t('title')}
        </h2>

        <div className={styles.intro}>
          <div className={styles.about}>
            {list('about').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className={styles.facts} aria-label={t('facts.label')}>
            {FACTS.map((fact) => (
              <div key={fact} className={styles.fact}>
                <dt>{t(`facts.${fact}Label`)}</dt>
                <dd>{t(`facts.${fact}`)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <h3 className={styles.heading}>{t('careerTitle')}</h3>
        <ol className={styles.career}>
          {career.map(({ id, from, to, stack }) => (
            <li key={id} className={styles.move}>
              <p className={styles.period}>
                {from} – {to ?? t('present')}
              </p>
              <div>
                <h4 className={styles.club}>
                  {t(`career.${id}.club`)}
                  <span className={styles.role}>{t(`career.${id}.role`)}</span>
                </h4>
                <p className={styles.place}>{t(`career.${id}.place`)}</p>
                <ul className={styles.points}>
                  {list(`career.${id}.points`).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {stack.length > 0 && (
                  <ChipList
                    className={styles.stack}
                    items={stack}
                    label={t('stackLabel', { club: t(`career.${id}.club`) })}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>

        <h3 className={styles.heading}>{t('skillsTitle')}</h3>
        <ul className={styles.skills}>
          {skillGroups.map(({ id, items }) => (
            <li key={id} className={styles.group}>
              <h4 className={styles.groupTitle}>{t(`skills.${id}`)}</h4>
              <ChipList items={items} label={t(`skills.${id}`)} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};
