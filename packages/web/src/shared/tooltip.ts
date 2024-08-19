export function circle(color: string, { size = 12 } = {}): string {
  const style = `
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: inline-block;
    `;
  return `<span style="${style}"></span>`;
}
