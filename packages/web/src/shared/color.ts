import colormap from 'colormap';

export const hexToRgb = (hex: string): [number, number, number] => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
};

export const textColorForBackground = (backgroundColor: string): string => {
  const [r, g, b] = hexToRgb(backgroundColor);

  if (r + g + b > 500) {
    return '#333333';
  }
  return '#FFFFFF';
};

export const isHexColorValid = (hex: string): boolean => {
  if (!hex) return false;

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);

  return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(fullHex);
};

export const COLORMAP = [
  'jet',
  'hsv',
  'hot',
  'cool',
  'spring',
  'summer',
  'autumn',
  'winter',
  'bone',
  'copper',
  'greys',
  'YIGnBu',
  'greens',
  'YIOrRd',
  'bluered',
  'RdBu',
  'picnic',
  'rainbow',
  'portland',
  'blackbody',
  'earth',
  'electric',
  'viridis',
  'inferno',
  'magma',
  'plasma',
  'warm',
  'cool',
  'rainbow-soft',
  'bathymetry',
  'cdom',
  'chlorophyll',
  'density',
  'freesurface-blue',
  'freesurface-red',
  'oxygen',
  'par',
  'phase',
  'salinity',
  'temperature',
  'turbidity',
  'velocity-blue',
  'velocity-green',
  'cubehelix',
];

export const createColormap = (name: string, { nshades = 32, format = 'hex' as const, alpha = 1 } = {}) => {
  return colormap({
    colormap: name,
    nshades,
    format,
    alpha,
  });
};
