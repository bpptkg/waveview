import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import ReactEChartsCore from "./core";
import type { ReactEChartsProps } from "./types";

export { createGrid, makeIndex, type GridOptions } from "./helper/grid";
export type { EChartsOption, ReactEChartsProps as EChartsReactProps };

// export the Component the echarts Object.
export class ReactECharts extends ReactEChartsCore {
  constructor(props: ReactEChartsProps) {
    super(props);

    // 初始化为 echarts 整个包
    this.echarts = echarts;
  }
}
