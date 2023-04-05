import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createBasicConfig();

export default merge(baseConfig, {
  input: {
    index: './build/out-tsc/index.js'
  },
  output: {
    dir: './build/js',
    format: 'iife',
    entryFileNames: '[name].js'
  }
});
