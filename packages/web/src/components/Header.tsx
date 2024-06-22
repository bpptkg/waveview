import { Switch } from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { useAppStore } from '../stores/app';
import Account from './Account';
import ArrowNavigation from './ArrowNavigation';
import Logo from './Logo';
import LogoText from './LogoText';
import Notification from './Notification';
import SearchBox from './SearchBox';

const Header = () => {
  const { darkMode, toggleTheme } = useAppStore();

  const handleToggleDarkMode = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.currentTarget.checked;
      toggleTheme(checked ? 'dark' : 'light');
    },
    [toggleTheme]
  );

  return (
    <div className="flex h-[48px] items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <Logo />
        <LogoText />
      </div>
      <div className="flex items-center gap-2">
        <ArrowNavigation />
        <SearchBox />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={darkMode} label="Dark mode" onChange={handleToggleDarkMode} />
        <Notification />
        <Account />
      </div>
    </div>
  );
};

export default Header;
