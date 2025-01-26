import typescript from '@rollup/plugin-typescript'; // Import TypeScript plugin
import postcss from 'rollup-plugin-postcss'; // Import PostCSS plugin

export default {
  input: 'src/index.ts', // Your entry file
  output: {
    dir: 'dist',
    format: 'es', // ES Module format
    name: 'pixfly-kit', // Global variable name
    sourcemap: true, // Optional: Adds sourcemaps
  },
  external: ['react', 'react-dom', 'framer-motion', 'axios'], // External dependencies
  plugins: [
    typescript({
      tsconfig: './tsconfig.json', // Path to your TypeScript config file
    }),
    postcss({
      extract: 'styles.css', // Extract CSS into a separate file in dist/
      config: {
        path: './postcss.config.cjs', // Path to your PostCSS config
      },
      extensions: ['.css'],
      minimize: true, // Minimize CSS
      inject: {
        insertAt: 'top',
      },
    }),
  ],
};
