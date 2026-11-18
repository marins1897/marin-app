import { useTranslation } from 'react-i18next';
import styles from './chapter-rail.module.scss';

export interface ChapterRailProps<C extends string> {
  chapters: readonly C[];
  current: C;
  /** Maps a chapter id to its key under `chapters` in the `home` namespace. */
  labelKey: (chapter: C) => string;
  /** Jumps to a chapter. */
  onSelect: (chapter: C) => void;
  className?: string;
}

/** Where in the walk-out the visitor is, as broadcast-style steps; each one jumps there. */
export const ChapterRail = <C extends string>({
  chapters,
  current,
  labelKey,
  onSelect,
  className,
}: ChapterRailProps<C>) => {
  const { t } = useTranslation('home');

  return (
    <nav aria-label={t('chapters.label')} className={className}>
      <ol className={styles.list}>
        {chapters.map((chapter) => (
          <li key={chapter}>
            <button
              type="button"
              className={styles.step}
              aria-current={chapter === current ? 'step' : undefined}
              onClick={() => onSelect(chapter)}
            >
              {t(labelKey(chapter))}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};
