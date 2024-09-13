import { useHelicorderCallback } from './useHelicorderCallback';
import { useSeismogramCallback } from './useSeismogramCallback';

export const usePickerCallback = () => {
  return { ...useHelicorderCallback(), ...useSeismogramCallback() };
};
