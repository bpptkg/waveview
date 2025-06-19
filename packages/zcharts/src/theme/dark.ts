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
  pickAssistantStyle: {
    color: "#FF0000",
    opacity: 1,
    lineWidth: 1,
    lineType: "dashed",
    lineDash: [5, 5],
    lineCap: "round",
    lineJoin: "round",
  }
};
