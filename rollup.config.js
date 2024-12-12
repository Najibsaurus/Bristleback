import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/VideoRecorder.ts',
  output: [
    {
      file: 'dist/VideoRecorder.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/VideoRecorder.esm.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/VideoRecorder.umd.js',
      format: 'umd',
      name: 'VideoRecorder',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
});
