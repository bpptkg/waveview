import { ThemeStyle } from "../util/types";

export const lightTheme: ThemeStyle = {
  backgroundColor: "#FFFFFF",
  foregroundColor: "#000000",
  textColor: "#000000",
  fontSize: 11,
  fontFamily: "Arial",
  axisStyle: {
    axisLineColor: "#000000",
    axisTickColor: "#000000",
    splitLineColor: "#000000",
  },
  gridStyle: {
    lineColor: "#000000",
    lineWidth: 1,
  },
  seriesStyle: {
    lineColor: "#000000",
    lineWidth: 1,
  },
  highlightStyle: {
    color: "#9747FF",
    opacity: 0.75,
    borderWidth: 1,
  },
  axisPointerStyle: {
    lineColor: "#FF0000",
    lineWidth: 1,
    textColor: "#FFFFFF",
    fontSize: 11,
    backgroundColor: "#FF0000",
  },
  pickerStyle: {
    color: "#9747FF",
    opacity: 0.4,
    borderWidth: 1,
  },
};
