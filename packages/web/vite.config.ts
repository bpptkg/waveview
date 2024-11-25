import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const commitHash = execSync('git rev-parse HEAD').toString().trim();
const packageJsonPath = resolve(__dirname, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const packageVersion = packageJson.version;

const buildDate = new Date();

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.__COMMIT__HASH__': JSON.stringify(commitHash),
    'import.meta.env.__PACKAGE__VERSION__': JSON.stringify(packageVersion),
    'import.meta.env.__BUILD__DATE__': JSON.stringify(buildDate.toISOString()),
  },
  optimizeDeps: {
    force: true,
  }
});
