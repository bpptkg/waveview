import { ThemeStyle } from "../util/types";

export const lightTheme: ThemeStyle = {
  backgroundColor: "#fff",
  foregroundColor: "#000",
  textColor: "#000",
  fontSize: 11,
  fontFamily: "Arial",
  axisStyle: {
    axisLineColor: "#000",
    axisTickColor: "#000",
    splitLineColor: "#000",
  },
  gridStyle: {
    lineColor: "#000",
    lineWidth: 1,
  },
  seriesStyle: {
    lineColor: "#000",
    lineWidth: 1,
  },
  highlightStyle: {
    color: "#9747ff",
    opacity: 0.25,
    borderWidth: 1,
  },
  axisPointerStyle: {
    lineColor: "#ff0000",
    lineWidth: 1,
    textColor: "#fff",
    fontSize: 12,
    backgroundColor: "#ff0000",
  }
};
