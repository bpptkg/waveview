import { ECharts, EChartsOption, init } from "echarts";
import React, {
  CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface ReactEChartsProps {
  option?: EChartsOption;
  className?: string;
  style?: CSSProperties;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  showLoading?: boolean;
  loadingOption?: any;
  autoResize?: boolean;
}

export interface ReactEChartsType {
  getInstance: () => ECharts;
  setOption: (
    option: EChartsOption,
    notMerge?: boolean,
    lazyUpdate?: boolean
  ) => void;
  clear: () => void;
  resize: () => void;
  showLoading: () => void;
  hideLoading: () => void;
  dispose: () => void;
  toDataURL: (options?: {
    type?: "png" | "jpeg" | "svg";
    backgroundColor?: string;
    pixelRatio?: number;
    excludeComponents?: string[];
  }) => string | undefined;
}

export const ReactECharts: React.ForwardRefExoticComponent<
  ReactEChartsProps & React.RefAttributes<ReactEChartsType>
> = React.forwardRef((props, ref) => {
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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useImperativeHandle(ref, () => ({
    getInstance: () => echartInstanceRef.current!,
    setOption: (
      option: EChartsOption,
      notMerge?: boolean,
      lazyUpdate?: boolean
    ) => {
      echartInstanceRef.current?.setOption(option, notMerge, lazyUpdate);
    },
    clear: () => {
      echartInstanceRef.current?.clear();
    },
    resize: () => {
      echartInstanceRef.current?.resize();
    },
    showLoading: () => {
      echartInstanceRef.current?.showLoading();
    },
    hideLoading: () => {
      echartInstanceRef.current?.hideLoading();
    },
    dispose: () => {
      echartInstanceRef.current?.dispose();
    },
    toDataURL: (options?: {
      type?: "png" | "jpeg" | "svg";
      backgroundColor?: string;
      pixelRatio?: number;
      excludeComponents?: string[];
    }) => {
      return echartInstanceRef.current?.getDataURL(options);
    },
  }));

  const onResize = (entries: ResizeObserverEntry[]) => {
    if (autoResize) {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        echartInstanceRef.current?.resize({ width, height });
      }
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      echartInstanceRef.current = init(containerRef.current);
      echartInstanceRef.current.setOption(option || {}, notMerge, lazyUpdate);
      if (showLoading) echartInstanceRef.current.showLoading(loadingOption);
      else echartInstanceRef.current.hideLoading();
      if (autoResize) {
        resizeObserverRef.current = new ResizeObserver(onResize);
        resizeObserverRef.current.observe(containerRef.current);
      }
    }

    return () => {
      if (autoResize) {
        resizeObserverRef.current?.disconnect();
      }
      echartInstanceRef.current?.dispose();
    };
  }, [option, notMerge, lazyUpdate, showLoading, loadingOption, autoResize]);

  return <div ref={containerRef} style={style} className={className}></div>;
});
