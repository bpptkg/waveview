/// <reference types="vite/client" />

declare module 'echarts-gl/charts' {
  export const Scatter3DChart: any;
  export const SurfaceChart: any;
}

declare module 'echarts-gl/components' {
  export const Grid3DComponent: any;
}

declare module 'zstd-codec' {
  export class Simple {
    compress(data: Uint8Array, level?: number): Uint8Array;
    decompress(data: Uint8Array): Uint8Array;
  }

  export class ZstdType {
    Simple: typeof Simple;
  }

  export class ZstdCodec {
    static run(callback: (zstd: ZstdType) => void): void;
  }
}
