import { ThemeStyle } from "../util/types";

export const darkTheme: ThemeStyle = {
  backgroundColor: "#1F1F1F",
  foregroundColor: "#FFFFFF",
  textColor: "#FFFFFF",
  fontSize: 11,
  fontFamily: "Arial",
  axisStyle: {
    axisLineColor: "#FFFFFF",
    axisTickColor: "#FFFFFF",
    splitLineColor: "#FFFFFF",
  },
  gridStyle: {
    lineColor: "#FFFFFF",
    lineWidth: 1,
  },
  seriesStyle: {
    lineColor: "#FFFFFF",
    lineWidth: 1,
  },
  highlightStyle: {
    color: "#9747ff",
    opacity: 0.75,
    borderWidth: 1,
  },
  axisPointerStyle: {
    lineColor: "#FF0000",
    lineWidth: 1,
    textColor: "#FFFFFF",
    fontSize: 12,
    backgroundColor: "#FF0000",
  },
};
