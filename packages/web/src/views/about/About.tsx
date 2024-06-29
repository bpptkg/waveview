import { FluentProvider, Link, webLightTheme } from '@fluentui/react-components';
import LogoImage from '../../components/Header/LogoImage';
import LogoText from '../../components/Header/LogoText';

const VersionInfo = () => {
  const buildDate = new Date();
  const thisYear = buildDate.getFullYear();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-gray-800 dark:text-neutral-grey-84">Version 1.0.0</span>
      <span className="text-gray-800 dark:text-neutral-grey-84">Build: 123456</span>
      <span className="text-gray-800 dark:text-neutral-grey-84">Date: {buildDate.toISOString()}</span>
      <span className="text-gray-800 dark:text-neutral-grey-84">Copyright © {thisYear} BPPTKG</span>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="inline-flex gap-2 items-center">
      <LogoImage size={40} />
      <LogoText />
    </div>
  );
};

const About = () => {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center p-2 bg-brand-hosts-150">
        <div className="flex flex-col gap-4 w-1/2 p-4 rounded-2xl bg-white dark:bg-neutral-grey-4">
          <Logo />
          <div className="flex">
            <div className="flex flex-col flex-grow">
              <VersionInfo />
            </div>

            <div className="flex-grow items-start justify-center flex flex-col gap-2">
              <Link href="https://github.com/bpptkg/waveview">GitHub</Link>
              <Link href="https://github.com/bpptkg/waveview/issues">Report an issue</Link>
              <Link href="https://github.com/bpptkg/waveview/blob/main/LICENSE">View license</Link>
            </div>
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};

export default About;
