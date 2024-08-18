import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import EChartsReactCore from "./core";
import type { EChartsReactProps } from "./types";

export { createGrid, makeIndex, type GridOptions } from "./helper/grid";
export type { EChartsOption, EChartsReactProps };

// export the Component the echarts Object.
export default class EChartsReact extends EChartsReactCore {
  constructor(props: EChartsReactProps) {
    super(props);

    // 初始化为 echarts 整个包
    this.echarts = echarts;
  }
}
