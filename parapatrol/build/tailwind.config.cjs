// Builds ../shopify/assets/parapatrol.css from the Liquid + JS files.
// - Utilities are scoped under `.pp` so they never leak into the theme.
// - Preflight is off (theme keeps its reset); src.css has a small scoped reset instead.
// - Every size is in px, because many themes (Dawn and friends) set html { font-size: 62.5% },
//   which would shrink rem-based Tailwind values.
const px = (n) => `${n}px`;
const spacing = { px: '1px', 0: '0px' };
[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]
  .forEach((n) => { spacing[n] = px(n * 4); });

module.exports = {
  content: ['../shopify/**/*.liquid', '../shopify/assets/parapatrol.js'],
  important: '.pp',
  corePlugins: { preflight: false },
  theme: {
    spacing,
    fontSize: {
      xs: ['12px', '16px'], sm: ['14px', '20px'], base: ['16px', '24px'], lg: ['18px', '28px'],
      xl: ['20px', '28px'], '2xl': ['24px', '32px'], '3xl': ['30px', '36px'], '4xl': ['36px', '40px']
    },
    borderRadius: {
      none: '0px', sm: '2px', DEFAULT: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', '3xl': '24px', full: '9999px'
    },
    maxWidth: {
      none: 'none', full: '100%', xs: '320px', sm: '384px', md: '448px', lg: '512px', xl: '576px',
      '2xl': '672px', '3xl': '768px', '4xl': '896px', '5xl': '1024px', '6xl': '1152px'
    },
    extend: {
      colors: {
        primary: 'var(--brand-primary)',
        'primary-dark': 'var(--brand-primary-dark)',
        accent: 'var(--brand-accent)',
        berry: 'var(--brand-berry)',
        soft: 'var(--bg-soft)',
        mint: 'var(--bg-mint)',
        ink: 'var(--ink)',
        muted: 'var(--ink-muted)',
        line: 'var(--line)'
      },
      fontFamily: {
        display: ['var(--pp-font-display)'],
        sans: ['var(--pp-font-body)']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,45,79,.04), 0 8px 24px -8px rgba(30,45,79,.12)',
        lift: '0 2px 4px rgba(30,45,79,.05), 0 18px 40px -12px rgba(30,45,79,.18)'
      }
    }
  }
};
