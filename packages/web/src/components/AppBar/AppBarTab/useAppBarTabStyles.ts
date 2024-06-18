import { AppBarTabState } from './AppBarTab.types';

export const useAppBarTabStyles = (state: AppBarTabState) => {
  return {
    root: 'w-[68px] h-[56px] flex flex-col items-center justify-center relative',
    indicator: 'absolute left-0 top-0 bottom-0 w-1 bg-brand-hosts-70 rounded-sm',
    content: state.selected ? 'text-xs text-brand-hosts-70' : 'text-xs',
    primaryFill: '#115EA3',
  };
};
