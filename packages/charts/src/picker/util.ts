export function createArrowPoints(
  x: number,
  y: number,
  size: number,
  head: "left" | "right"
): number[] {
  if (head === "left") {
    return [x, y, x + size, y + size, x + size, y - size];
  } else {
    return [x, y, x - size, y + size, x - size, y - size];
  }
}
