import { FluentProvider, Link, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useEffect } from 'react';
import LogoImage from '../../components/Header/LogoImage';
import LogoText from '../../components/Header/LogoText';
import { useAppStore } from '../../stores/app';

const VersionInfo = () => {
  const thisYear = new Date().getFullYear();
  const commitHash = import.meta.env.__COMMIT__HASH__;
  const buildDate = import.meta.env.__BUILD__DATE__;
  const packageVersion = import.meta.env.__PACKAGE__VERSION__;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-gray-800 dark:text-neutral-grey-84">Version: {packageVersion}</span>
      <span className="text-gray-800 dark:text-neutral-grey-84">Commit: {commitHash}</span>
      <span className="text-gray-800 dark:text-neutral-grey-84">Date: {buildDate}</span>
      <span className="text-gray-800 dark:text-neutral-grey-84">Copyright © {thisYear} WaveView Developers</span>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="inline-flex gap-2 items-center">
      <LogoImage size={32} />
      <LogoText />
    </div>
  );
};

const About = () => {
  const { darkMode, theme, toggleTheme } = useAppStore();

  useEffect(() => {
    toggleTheme(theme);
  }, [theme, toggleTheme]);

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <title>About &middot; WaveView</title>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center p-2 bg-gradient-matcha dark:bg-gradient-matcha-dark">
        <div className="flex flex-col gap-4 w-1/2 p-4 rounded-2xl bg-white dark:bg-neutral-grey-14">
          <Logo />
          <div className="flex">
            <div className="flex flex-col flex-grow">
              <VersionInfo />
            </div>

            <div className="flex-grow items-start justify-center flex flex-col gap-2">
              <Link href="https://github.com/bpptkg/waveview" target="_blank">
                GitHub
              </Link>
              <Link href="https://github.com/bpptkg/waveview/issues" target="_blank">
                Report an issue
              </Link>
              <Link href="https://github.com/bpptkg/waveview/blob/main/LICENSE" target="_blank">
                View license
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};

export default About;
