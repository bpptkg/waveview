declare module "./CustomPiecewiseModel" {
  export default class PiecewiseModel {}
}

declare module "./CustomPiecewiseView" {
  export default class PiecewiseView {}
}

export function install(registers: {
  registerComponentModel: (model: typeof PiecewiseModel) => void;
  registerComponentView: (view: typeof PiecewiseView) => void;
}): void;
