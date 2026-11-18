/** Palette (non-semantic) tokens may only be referenced from tokens.scss. */
const paletteUsage =
  '/var\\(--(primary|secondary|neutral|system|error|warning|success)-[a-z0-9-]+[\\s,)]/';

/** Properties that must be driven by tokens (see CLAUDE.md § Styling). */
const TOKEN_ONLY_PROPERTIES = [
  '/color$/',
  'background',
  'fill',
  'stroke',
  'box-shadow',
  'font-family',
  'font-size',
  '/^margin/',
  '/^padding/',
  'gap',
  'row-gap',
  'column-gap',
  'border-radius',
  'transition-duration',
  'z-index',
];

const KEYWORDS = [
  'inherit',
  'transparent',
  'currentColor',
  'currentcolor',
  'none',
  '0',
  'auto',
  'initial',
  'unset',
  'revert',
];

export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-declaration-strict-value'],
  ignoreFiles: ['coverage/**', 'build/**', 'node_modules/**'],
  rules: {
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message:
          'Class names must be kebab-case (accessed camelCased via localsConvention).',
      },
    ],
    'selector-id-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
    'color-hex-length': 'long',
    // CSS modules: `:global(...)` reaches the `data-js` flag on <html>.
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    'declaration-property-value-disallowed-list': {
      '/.*/': [paletteUsage],
    },
    'scale-unlimited/declaration-strict-value': [
      TOKEN_ONLY_PROPERTIES,
      {
        ignoreVariables: true,
        ignoreFunctions: false,
        expandShorthand: true,
        disableFix: true,
        ignoreKeywords: KEYWORDS,
        ignoreValues: {
          '': [
            '/^spacing\\(/',
            '/^var\\(--[a-z0-9-]+\\)(\\s+var\\(--[a-z0-9-]+\\))*$/',
          ],
          'font-size': ['/^clamp\\(var\\(--/'],
          'font-family': ['/^var\\(--font-[a-z]+\\)/'],
          'z-index': ['-1', '1'],
        },
        message:
          'Expected a design token for "${property}" (got "${value}"). See docs/TOKENS.md.',
      },
    ],
  },
  overrides: [
    {
      // The token layer defines the raw values everything else consumes.
      files: [
        'src/styles/tokens.scss',
        'src/styles/palette.scss',
        'src/styles/fonts.scss',
      ],
      rules: {
        'declaration-property-value-disallowed-list': null,
        'scale-unlimited/declaration-strict-value': null,
      },
    },
  ],
};
