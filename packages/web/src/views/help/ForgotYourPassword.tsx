import { FluentProvider, Link, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useEffect } from 'react';
import { useAppStore } from '../../stores/app';

const ForgotYourPassword = () => {
  const { darkMode, theme, toggleTheme } = useAppStore();

  useEffect(() => {
    toggleTheme(theme);
  }, [theme, toggleTheme]);

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <title>Forgot your password &middot; WaveView</title>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center p-2 fixed top-0 left-0 bg-gradient-matcha dark:bg-gradient-matcha-dark">
        <div className="flex flex-col gap-4 w-1/2 p-4 rounded-2xl bg-white dark:bg-neutral-grey-14 overflow-auto max-h-[90%] h-auto">
          <div className="flex flex-col gap-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-grey-84">Forgot your password?</h1>
            <p className="text-gray-800 dark:text-neutral-grey-84">
              If you have forgotten your password, please contact your system administrator to reset it.
            </p>

            <p className="text-gray-800 dark:text-neutral-grey-84">
              If you have any questions or concerns, please contact us at{' '}
              <Link href="https://github.com/bpptkg/waveview" target="_blank">
                GitHub
              </Link>
              .
            </p>

            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};

export default ForgotYourPassword;
