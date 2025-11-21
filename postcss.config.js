/**
 * PostCSS Configuration
 * Loginet Invoice Management System
 *
 * Purpose: Process and optimize CSS for production
 * Last Updated: 2025-11-21
 */

module.exports = (ctx) => ({
  map: ctx.env !== 'production' ? { inline: false } : false,
  plugins: {
    // Import CSS files (@import statements)
    'postcss-import': {
      path: ['WebSite/assets/css']
    },

    // Modern CSS features with fallbacks
    'postcss-preset-env': {
      stage: 3, // CSS Stage 3 = stable features
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true
      },
      autoprefixer: {
        grid: 'autoplace' // IE 11 grid support
      }
    },

    // Add vendor prefixes automatically
    'autoprefixer': {
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'not dead',
        'Chrome >= 90',
        'Firefox >= 88',
        'Safari >= 14',
        'Edge >= 90'
      ],
      grid: 'autoplace'
    },

    // Minify CSS (production only)
    ...(ctx.env === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          reduceIdents: false, // Keep @keyframe names
          zindex: false, // Don't modify z-index
          mergeRules: true,
          minifyFontValues: true,
          minifyGradients: true
        }]
      }
    } : {})
  }
});
