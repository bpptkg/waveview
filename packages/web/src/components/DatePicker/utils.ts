export function today(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
