import { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(store: S) => {
  const storeIn = store as WithSelectors<typeof store>;
  storeIn.use = {};
  for (const k of Object.keys(storeIn.getState())) {
    (storeIn.use as any)[k] = () => storeIn((s) => s[k as keyof typeof s]);
  }
  return storeIn;
};
