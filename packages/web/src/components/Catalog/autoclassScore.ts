export const score = (value?: number | null) => value == null ? 'Not available' : `${Math.round(value * 100)}%`;
