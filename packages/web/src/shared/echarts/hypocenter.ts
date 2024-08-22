import { CallbackDataParams } from 'echarts/types/dist/shared';
import { HypocenterOrigin } from '../../types/hypocenter';
import { createColormap } from '../color';
import { formatNumber } from '../formatting';
import { fromLatLon } from '../geo';
import { formatTimezonedDate } from '../time';
import { circle } from '../tooltip';

export interface HypocenterOption {
  /**
   * Hypocenter data.
   */
  data: HypocenterOrigin[];
  /**
   * Topography data.
   */
  topo: [number, number, number][];
  /**
   * UTM zone number e.g., 51.
   */
  zoneNumber: number;
  surfaceMin: number;
  surfaceMax: number;
  timeMin: number;
  timeMax: number;
  darkMode?: boolean;
  useUTC?: boolean;
  /**
   * Vertical view angle.
   */
  alpha?: number;
  /**
   * Horizontal view angle.
   */
  beta?: number;
  minAlpha?: number;
  maxAlpha?: number;
  distance?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  zMin?: number;
  zMax?: number;
  showTimeColormap?: boolean;
  showSurfaceColormap?: boolean;
  surfaceColormap?: string;
  timeColormap?: string;
  symbol?: string;
  symbolSize?: number;
  surfaceOpacity?: number;
  surfaceShading?: string;
  showSurfaceWireframe?: boolean;
}

type Nullable<T> = T | null;

interface AspectRatioOptions {
  xMin?: Nullable<number>;
  xMax?: Nullable<number>;
  yMin?: Nullable<number>;
  yMax?: Nullable<number>;
  zMin?: Nullable<number>;
  zMax?: Nullable<number>;
}

function isNumber<T>(value: Nullable<T>): boolean {
  return typeof value === 'number';
}

function calculateAspectRatio(options: AspectRatioOptions): [number, number, number] {
  const { xMin, xMax, yMin, yMax, zMin, zMax } = options;
  if (isNumber(xMin) && isNumber(xMax) && isNumber(yMin) && isNumber(yMax) && isNumber(zMin) && isNumber(zMax)) {
    const xRange = xMax! - xMin!;
    const yRange = yMax! - yMin!;
    const zRange = zMax! - zMin!;
    const maxRange = Math.max(xRange, yRange, zRange);
    return [xRange / maxRange, yRange / maxRange, zRange / maxRange];
  } else {
    return [1, 1, 1];
  }
}

export const tooltipWrapper = (template: string) => {
  return `
  <div style="max-height:300px;overflow-y:hidden;font-size:0.85rem;line-height:0.92rem;">
    ${template}
  </div>
  `;
};

export function createHypocenterChartOption(options: HypocenterOption): any {
  const {
    data,
    topo,
    zoneNumber,
    darkMode = false,
    alpha = 20,
    beta = 40,
    minAlpha = -360,
    maxAlpha = 360,
    distance = 180,
    xMin,
    xMax,
    yMin,
    yMax,
    zMin,
    zMax,
    timeMin,
    timeMax,
    showTimeColormap = true,
    surfaceColormap = 'earth',
    timeColormap = 'rainbow',
    surfaceMin,
    surfaceMax,
    showSurfaceColormap = true,
    symbol = 'circle',
    symbolSize = 8,
    surfaceOpacity = 0.3,
    surfaceShading = 'color',
    showSurfaceWireframe = true,
    useUTC = false,
  } = options;

  const colors = {
    foreground: darkMode ? '#fff' : '#000',
    background: darkMode ? '#708090' : '#fff',
  };

  const aspectRatioOptions: AspectRatioOptions = {
    xMin,
    xMax,
    yMin,
    yMax,
    zMin,
    zMax,
  };

  const [xAspect, yAspect, zAspect] = calculateAspectRatio(aspectRatioOptions);
  const boxWidth = 100 * xAspect;
  const boxHeight = 100 * zAspect;
  const boxDepth = 100 * yAspect;

  const baseOption = {
    grid3D: {
      show: true,
      axisPointer: {
        show: true,
        lineStyle: {
          color: colors.foreground,
        },
      },
      environment: colors.background,
      viewControl: {
        autoRotate: false,
        autoRotateSpeed: false,
        distance,
        alpha,
        beta,
        minAlpha,
        maxAlpha,
        panSensitivity: 2,
        rotateSensitivity: 2,
        zoomSensitivity: 2,
      },
      boxWidth,
      boxHeight,
      boxDepth,
    },
    xAxis3D: {
      axisLabel: {
        formatter: (value: number) => `${(value / 1000).toFixed(0)}`,
        textStyle: {
          color: colors.foreground,
          fontSize: 11,
        },
        show: true,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
      },
      name: 'Easting (km)',
      nameTextStyle: {
        color: colors.foreground,
        fontSize: 12,
      },
      max: xMin,
      min: xMax,
      scale: true,
      type: 'value',
    },
    yAxis3D: {
      axisLabel: {
        formatter: (value: number) => `${(value / 1000).toFixed(0)}`,
        textStyle: {
          color: colors.foreground,
          fontSize: 11,
        },
        show: true,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
      },
      name: 'Northing (km)',
      nameTextStyle: {
        color: colors.foreground,
        fontSize: 12,
      },
      max: yMin,
      min: yMax,
      scale: true,
      type: 'value',
    },
    zAxis3D: {
      axisLabel: {
        formatter: (value: number) => `${(value / 1000).toFixed(1)}`,
        textStyle: {
          color: colors.foreground,
          fontSize: 11,
        },
        show: true,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
      },
      name: 'Elevation (km)',
      nameTextStyle: {
        color: colors.foreground,
        fontSize: 12,
      },
      max: zMax,
      min: zMin,
      scale: true,
      type: 'value',
    },
    tooltip: {
      enterable: true,
      trigger: 'item',
      formatter: (params: CallbackDataParams) => {
        const { value, color } = params;

        const val = value as (number | string)[];
        const time = formatTimezonedDate(val[3], 'yyyy-MM-dd HH:mm:ss', useUTC);
        const eventType = val[13];
        const magnitude = formatNumber(val[4], { precision: 1 });

        const latitude = formatNumber(val[5], { precision: 5, unit: '°' });
        const longitude = formatNumber(val[7], { precision: 5, unit: '°' });
        const depth = formatNumber(val[9], { precision: 1, unit: ' km' });

        const template = `${circle(color as string)} ${eventType}<br />
          Time: ${time}<br />
          Event type: ${eventType}<br />
          Magnitude: ${magnitude}<br />
          Latitude: ${latitude}<br />
          Longitude: ${longitude}<br />
          Depth: ${depth}
          `;
        return tooltipWrapper(template);
      },
    },
  };

  const surfaceColormapOption = {
    bottom: 50,
    right: 50,
    calculable: true,
    dimension: 2,
    inRange: { color: createColormap(surfaceColormap) },
    max: surfaceMax,
    min: surfaceMin,
    realtime: true,
    seriesIndex: 1,
    show: showSurfaceColormap,
    showLabel: true,
    text: ['Elevation (m)', ''],
    textStyle: {
      color: colors.foreground,
      fontSize: 10,
    },
    type: 'continuous',
    formatter: (value: number) => `${value.toFixed(0)}`,
  };

  const timeColormapOption = {
    bottom: 50,
    left: 50,
    calculable: true,
    dimension: 3,
    inRange: {
      color: createColormap(timeColormap),
      colorAlpha: 1,
      opacity: 1,
    },
    max: timeMax,
    min: timeMin,
    precision: 0,
    realtime: true,
    seriesIndex: 0,
    show: showTimeColormap,
    showLabel: true,
    text: ['Time', ''],
    textStyle: {
      color: colors.foreground,
      fontSize: 10,
    },
    type: 'continuous',
    formatter: (value: number) => formatTimezonedDate(value, 'yyyy-MM-dd HH:mm:ss', useUTC),
  };

  const magnitudeOption = {
    top: 50,
    left: 50,
    dimension: 4,
    maxOpen: true,
    pieces: [
      {
        min: 0,
        max: 1,
        symbolSize: 3,
        extendedProps: {
          itemWidth: 3,
          itemHeight: 3,
          itemSymbol: 'circle',
          itemColor: 'none',
          itemOutlineColor: colors.foreground,
        },
      },
      {
        min: 1,
        max: 2,
        symbolSize: 5,
        extendedProps: {
          itemWidth: 5,
          itemHeight: 5,
          itemSymbol: 'circle',
          itemColor: 'none',
          itemOutlineColor: colors.foreground,
        },
      },
      {
        min: 2,
        max: 3,
        symbolSize: 8,
        extendedProps: {
          itemWidth: 8,
          itemHeight: 8,
          itemSymbol: 'circle',
          itemColor: 'none',
          itemOutlineColor: colors.foreground,
        },
      },
      {
        min: 3,
        max: 4,
        symbolSize: 11,
        extendedProps: {
          itemWidth: 11,
          itemHeight: 11,
          itemSymbol: 'circle',
          itemColor: 'none',
          itemOutlineColor: colors.foreground,
        },
      },
      {
        min: 4,
        symbolSize: 14,
        extendedProps: {
          itemWidth: 14,
          itemHeight: 14,
          itemSymbol: 'circle',
          itemColor: 'none',
          itemOutlineColor: colors.foreground,
        },
      },
    ],
    realtime: false,
    seriesIndex: 0,
    showLabel: true,
    symbol: 'circle',
    text: ['Magnitude', ''],
    textStyle: {
      color: colors.foreground,
      fontSize: 10,
    },
    type: 'customPiecewise',
  };

  const seriesOption = [
    {
      blendMode: 'source-over',
      coordinateSystem: 'cartesian3D',
      symbol: symbol,
      symbolSize: symbolSize,
      type: 'scatter3D',
      data: data.map((e) => {
        const utm = fromLatLon(e.latitude, e.longitude, zoneNumber);
        return [
          utm.easting, // Array index: 0
          utm.northing, // 1
          e.depth * -1000, // 2: Depth is in km, so we convert it to meters.
          new Date(e.time).getTime(), // 3
          e.magnitude_value, // 4
          e.latitude, // 5
          e.latitude_uncertainty, // 6
          e.longitude, // 7
          e.longitude_uncertainty, // 8
          e.depth, // 9
          e.depth_uncertainty, // 10
          e.id, // 11
          e.magnitude_type, // 12
          e.event_type, // 13
        ];
      }),
    },
    {
      coordinateSystem: 'cartesian3D',
      data: topo,
      itemStyle: {
        opacity: surfaceOpacity,
      },
      shading: surfaceShading,
      silent: true,
      type: 'surface',
      wireframe: {
        show: showSurfaceWireframe,
      },
    },
  ];

  return {
    ...baseOption,
    visualMap: [timeColormapOption, magnitudeOption, surfaceColormapOption],
    series: seriesOption,
  };
}
