import { EChartsOption, EChartsType } from "echarts";
import { CSSProperties } from "react";

export type EChartsInstance = EChartsType;

export type Opts = {
  readonly devicePixelRatio?: number;
  readonly renderer?: "canvas" | "svg";
  readonly width?: number | null | undefined | "auto";
  readonly height?: number | null | undefined | "auto";
  readonly locale?: string;
};

export type ReactEChartsProps = {
  /**
   * echarts library entry, use it for import necessary.
   */
  readonly echarts?: any;
  /**
   * `className` for container
   */
  readonly className?: string;
  /**
   * `style` for container
   */
  readonly style?: CSSProperties;
  /**
   * echarts option
   */
  readonly option: EChartsOption;
  /**
   * echarts theme config, can be:
   * 1. theme name string
   * 2. theme object
   */
  readonly theme?: string | Record<string, any>;
  /**
   * notMerge config for echarts, default is `false`
   */
  readonly notMerge?: boolean;
  /**
   * lazyUpdate config for echarts, default is `false`
   */
  readonly lazyUpdate?: boolean;
  /**
   * showLoading config for echarts, default is `false`
   */
  readonly showLoading?: boolean;
  /**
   * loadingOption config for echarts, default is `null`
   */
  readonly loadingOption?: any;
  /**
   * echarts opts config, default is `{}`
   */
  readonly opts?: Opts;
  /**
   * when after chart render, do the callback with echarts instance
   */
  readonly onChartReady?: (instance: EChartsInstance) => void;
  /**
   * bind events, default is `{}`
   */
  readonly onEvents?: Record<string, Function>;
  /**
   * should update echarts options
   */
  readonly shouldSetOption?: (
    prevProps: ReactEChartsProps,
    props: ReactEChartsProps
  ) => boolean;

  /**
   * should trigger resize when window resize
   */
  readonly autoResize?: boolean;
};