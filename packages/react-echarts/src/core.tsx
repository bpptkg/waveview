import type { ECharts, EChartsOption } from "echarts";
import React, { PureComponent } from "react";
import { bind, clear } from "size-sensor";
import { isEqual } from "./helper/isEqual";
import { isFunction } from "./helper/isFunction";
import { isString } from "./helper/isString";
import { pick } from "./helper/pick";
import { EChartsInstance, ReactEChartsProps } from "./types";

/**
 * core component for echarts binding
 */
export default class ReactEChartsCore extends PureComponent<ReactEChartsProps> {
  /**
   * echarts render container
   */
  public ele: HTMLElement | null;

  /**
   * if this is the first time we are resizing
   */
  private isInitialResize: boolean;

  /**
   * echarts library entry
   */
  protected echarts: any;

  constructor(props: ReactEChartsProps) {
    super(props);

    this.echarts = props.echarts;
    this.ele = null;
    this.isInitialResize = true;
  }

  componentDidMount() {
    this.renderNewEcharts();
  }

  // update
  componentDidUpdate(prevProps: ReactEChartsProps) {
    /**
     * if shouldSetOption return false, then return, not update echarts options
     * default is true
     */
    const { shouldSetOption } = this.props;
    if (
      isFunction(shouldSetOption) &&
      !shouldSetOption?.(prevProps, this.props)
    ) {
      return;
    }

    // 以下属性修改的时候，需要 dispose 之后再新建
    // 1. 切换 theme 的时候
    // 2. 修改 opts 的时候
    // 3. 修改 onEvents 的时候，这样可以取消所有之前绑定的事件 issue #151
    if (
      !isEqual(prevProps.theme, this.props.theme) ||
      !isEqual(prevProps.opts, this.props.opts) ||
      !isEqual(prevProps.onEvents, this.props.onEvents)
    ) {
      this.dispose();

      this.renderNewEcharts(); // 重建
      return;
    }

    // when these props are not isEqual, update echarts
    const pickKeys = [
      "option",
      "notMerge",
      "lazyUpdate",
      "showLoading",
      "loadingOption",
    ];
    if (!isEqual(pick(this.props, pickKeys), pick(prevProps, pickKeys))) {
      this.updateEChartsOption();
    }

    /**
     * when style or class name updated, change size.
     */
    if (
      !isEqual(prevProps.style, this.props.style) ||
      !isEqual(prevProps.className, this.props.className)
    ) {
      this.resize();
    }
  }

  componentWillUnmount() {
    this.dispose();
  }

  /*
   * initialise an echarts instance
   */
  public async initEchartsInstance(): Promise<ECharts> {
    return new Promise((resolve) => {
      const width = this.ele?.clientWidth || 50;
      const height = this.ele?.clientHeight || 50;

      const opts = {
        width,
        height,
        ...this.props.opts,
      };
      resolve(this.echarts.init(this.ele, this.props.theme, opts));
    });
  }

  /**
   * return the existing echart object
   */
  public getEchartsInstance(): ECharts {
    return this.echarts.getInstanceByDom(this.ele);
  }

  /**
   * dispose echarts and clear size-sensor
   */
  private dispose() {
    if (this.ele) {
      try {
        clear(this.ele);
      } catch (e) {
        console.warn(e);
      }
      // dispose echarts instance
      this.echarts.dispose(this.ele);
    }
  }

  /**
   * render a new echarts instance
   */
  private async renderNewEcharts() {
    const { onEvents, onChartReady, autoResize = true } = this.props;

    // 1. init echarts instance
    await this.initEchartsInstance();

    // 2. update echarts instance
    const echartsInstance = this.updateEChartsOption();

    // 3. bind events
    this.bindEvents(echartsInstance, onEvents || {});

    // 4. on chart ready
    if (isFunction(onChartReady)) onChartReady?.(echartsInstance);

    // 5. on resize
    if (this.ele && autoResize) {
      bind(this.ele, () => {
        this.resize();
      });
    }
  }

  // bind the events
  private bindEvents(instance: any, events: ReactEChartsProps["onEvents"]) {
    function _bindEvent(eventName: string, func: Function) {
      // ignore the event config which not satisfy
      if (isString(eventName) && isFunction(func)) {
        // binding event
        instance.on(eventName, (param: any) => {
          func(param, instance);
        });
      }
    }

    // loop and bind
    for (const eventName in events) {
      if (Object.prototype.hasOwnProperty.call(events, eventName)) {
        _bindEvent(eventName, events[eventName]);
      }
    }
  }

  /**
   * render the echarts
   */
  private updateEChartsOption(): EChartsInstance {
    const {
      option,
      notMerge = false,
      lazyUpdate = false,
      showLoading,
      loadingOption = null,
    } = this.props;
    // 1. get or initial the echarts object
    const echartInstance = this.getEchartsInstance();
    // 2. set the echarts option
    echartInstance.setOption(option, notMerge, lazyUpdate);
    // 3. set loading mask
    if (showLoading) echartInstance.showLoading(loadingOption);
    else echartInstance.hideLoading();

    return echartInstance;
  }

  /**
   * resize wrapper
   */
  private resize() {
    // 1. get the echarts object
    const echartsInstance = this.getEchartsInstance();

    // 2. call echarts instance resize if not the initial resize
    // resize should not happen on first render as it will cancel initial echarts animations
    if (!this.isInitialResize) {
      try {
        echartsInstance.resize({
          width: "auto",
          height: "auto",
        });
      } catch (e) {
        console.warn(e);
      }
    }

    // 3. update variable for future calls
    this.isInitialResize = false;
  }

  render(): JSX.Element {
    const { style, className = "" } = this.props;
    // default height = 300
    const newStyle = { height: 300, ...style };

    return (
      <div
        ref={(ele) => {
          this.ele = ele;
        }}
        style={newStyle}
        className={`echarts-for-react ${className}`}
      />
    );
  }

  setOption(option: EChartsOption, notMerge?: boolean, lazyUpdate?: boolean) {
    this.getEchartsInstance().setOption(option, notMerge, lazyUpdate);
  }

  showLoading() {
    this.getEchartsInstance().showLoading();
  }

  hideLoading() {
    this.getEchartsInstance().hideLoading();
  }

  clear() {
    this.getEchartsInstance().clear();
  }

  toDataURL(options: {
    type?: "png" | "jpeg" | "svg";
    backgroundColor?: string;
    pixelRatio?: number;
    excludeComponents?: string[];
  }) {
    return this.getEchartsInstance().getDataURL(options);
  }
}
