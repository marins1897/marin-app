/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}

/** Output of vite-imagetools for `?picture` imports (see vite.config.ts). */
declare module '*?picture' {
  const picture: {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  };
  export default picture;
}

/** One 1280px JPEG URL for `?screen` imports (see vite.config.ts). */
declare module '*?screen' {
  const src: string;
  export default src;
}
