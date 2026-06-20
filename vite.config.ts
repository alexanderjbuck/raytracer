/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/raytracer/',
  test: {
    environment: 'node',
  },
});