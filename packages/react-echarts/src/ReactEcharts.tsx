import { ECharts, EChartsOption, init } from "echarts";
import React, { CSSProperties, useEffect, useRef } from "react";

export interface ReactEChartsProps {
  option: EChartsOption;
  className?: string;
  style?: CSSProperties;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  showLoading?: boolean;
  loadingOption?: any;
  autoResize?: boolean;
}

export const ReactECharts: React.FC<ReactEChartsProps> = (
  props: ReactEChartsProps
) => {
  const {
    option,
    className,
    style,
    notMerge,
    lazyUpdate,
    showLoading,
    loadingOption,
    autoResize,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const echartInstanceRef = useRef<ECharts | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      echartInstanceRef.current = init(containerRef.current);
      echartInstanceRef.current.setOption(option, notMerge, lazyUpdate);
      if (showLoading) echartInstanceRef.current.showLoading(loadingOption);
      else echartInstanceRef.current.hideLoading();
      if (autoResize) {
        window.addEventListener(
          "resize",
          () => {
            echartInstanceRef.current?.resize();
          },
          { passive: true }
        );
      }
    }

    return () => {
      if (autoResize) {
        window.removeEventListener("resize", () => {
          echartInstanceRef.current?.resize();
        });
      }
      echartInstanceRef.current?.dispose();
    };
  }, [option, notMerge, lazyUpdate, showLoading, loadingOption, autoResize]);

  return <div ref={containerRef} style={style} className={className}></div>;
};
