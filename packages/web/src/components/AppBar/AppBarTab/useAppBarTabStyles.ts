import { makeStyles, tokens } from '@fluentui/react-components';

export const useAppBarTabStyles = makeStyles({
  root: {
    width: '68px',
    height: '56px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: tokens.colorBrandForegroundLinkSelected,
    borderRadius: '2px',
  },
  content: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: tokens.colorNeutralForeground2,
  },
  contentSelected: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: tokens.colorBrandForegroundLinkSelected,
  },
  icon: {
    color: tokens.colorNeutralForeground2,
  },
  iconSelected: {
    color: tokens.colorBrandForegroundLinkSelected,
  },
});
