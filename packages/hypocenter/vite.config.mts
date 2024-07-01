import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: new URL("src/index.ts", import.meta.url).pathname,
      name: "hypocenter",
      fileName: (format) => `index.${format}.js`,
    },
    outDir: "./dist",
  },
  plugins: [dts({ rollupTypes: true })],
});
