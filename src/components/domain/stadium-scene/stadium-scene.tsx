import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '@/utils/class-names';
import styles from './stadium-scene.module.scss';
import type {
  StadiumController,
  StadiumCopy,
  StadiumFocus,
} from './lib/create-stadium';

export interface StadiumSceneProps {
  progressRef: RefObject<number>;
  focus: StadiumFocus;
  /** Must be referentially stable: a new object rebuilds the scene. */
  copy: StadiumCopy;
  className?: string;
}

type Status = 'loading' | 'ready' | 'unavailable';

const SCENE_FACES = ["40px 'Russo One'", "600 40px 'Saira Condensed'"];

const whenIdle = (): Promise<void> =>
  new Promise((resolve) => {
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout: 1200 });
    } else {
      globalThis.setTimeout(resolve, 200);
    }
  });

/**
 * The 3D Poljud stadium. Three.js and the scene code load as their own chunk
 * once the page is idle, so the prerendered text paints first. Without WebGL
 * the hero keeps working with its plain background.
 */
export const StadiumScene = ({
  progressRef,
  focus,
  copy,
  className,
}: StadiumSceneProps) => {
  const { t } = useTranslation('home');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<StadiumController | null>(null);
  const focusRef = useRef(focus);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let isCancelled = false;

    const start = async () => {
      await whenIdle();
      const [{ createStadium }] = await Promise.all([
        import('./lib/create-stadium'),
        ...SCENE_FACES.map((face) => document.fonts?.load(face)),
      ]);
      if (isCancelled) return;
      controllerRef.current = createStadium(canvas, {
        copy,
        getProgress: () => progressRef.current,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
          .matches,
        lowPower: window.matchMedia('(max-width: 760px)').matches,
      });
      controllerRef.current.setFocus(focusRef.current);
      setStatus('ready');
    };

    start().catch((error: unknown) => {
      console.warn('3D stadium unavailable:', error);
      if (!isCancelled) setStatus('unavailable');
    });

    return () => {
      isCancelled = true;
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [copy, progressRef]);

  useEffect(() => {
    focusRef.current = focus;
    controllerRef.current?.setFocus(focus);
  }, [focus]);

  return (
    <div className={cx(styles.scene, className)} data-status={status}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {status !== 'ready' && (
        <p className={styles.status} role="status">
          {status === 'loading' ? t('scene.loading') : t('scene.unavailable')}
        </p>
      )}
    </div>
  );
};
