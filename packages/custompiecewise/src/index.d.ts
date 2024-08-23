import PiecewiseModel from "./CustomPiecewiseModel";
import PiecewiseView from "./CustomPiecewiseView";

declare module "./CustomPiecewiseModel" {
  export default class PiecewiseModel {}
}

declare module "./CustomPiecewiseView" {
  export default PiecewiseView;
}

export function VisualMapCustomPiecewiseComponent(registers: {
  registerComponentModel: (model: typeof PiecewiseModel) => void;
  registerComponentView: (view: typeof PiecewiseView) => void;
}): void;
