import { Helicorder } from "./chart/helicorder";


export function generateSinusoidalSignal(
  min: number,
  max: number,
  num_points: number
): number[][] {
  const data = [];
  const step = (max - min) / num_points;
  for (let i = 0; i < num_points; i++) {
    data.push([
      min + i * step,
      Math.sin(i) + Math.random() - 0.5,
    ]);
  }
  return data;
}


const dom = document.getElementById("chart") as HTMLCanvasElement;

const helicorder = new Helicorder(dom);
await helicorder.init();

const data = generateSinusoidalSignal(0, 60, 100);
helicorder.update();

