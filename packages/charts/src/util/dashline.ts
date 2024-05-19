import * as PIXI from "pixi.js";

export function drawDash(
  target: PIXI.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashLength = 5,
  spaceLength = 5
) {
  let x = x2 - x1;
  let y = y2 - y1;
  let hyp = Math.sqrt(x * x + y * y);
  let units = hyp / (dashLength + spaceLength);
  let dashSpaceRatio = dashLength / (dashLength + spaceLength);
  let dashX = (x / units) * dashSpaceRatio;
  let spaceX = x / units - dashX;
  let dashY = (y / units) * dashSpaceRatio;
  let spaceY = y / units - dashY;

  target.moveTo(x1, y1);

  while (hyp > 0) {
    x1 += dashX;
    y1 += dashY;
    hyp -= dashLength;
    if (hyp < 0) {
      x1 = x2;
      y1 = y2;
    }
    target.lineTo(x1, y1);
    x1 += spaceX;
    y1 += spaceY;
    target.moveTo(x1, y1);
    hyp -= spaceLength;
  }
  target.moveTo(x2, y2);
}
