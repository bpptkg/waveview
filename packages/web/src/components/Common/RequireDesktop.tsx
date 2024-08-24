import React, { useEffect, useState } from 'react';
import LogoImage from '../Header/LogoImage';
import LogoText from '../Header/LogoText';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop;
};

export interface RequireDesktopProps {
  children: React.ReactNode;
}

const RequireDesktop: React.FC<RequireDesktopProps> = ({ children }) => {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-neutral-grey-94 dark:bg-neutral-grey-4">
        <div className="text-center p-6 bg-neutral-grey-98 dark:bg-neutral-grey-12 rounded-lg shadow-md">
          <div className="inline-flex items-center gap-2 mb-4">
            <LogoImage />
            <LogoText />
          </div>
          <p>We are sorry, but WaveView is only available on desktop devices.</p>
          <p>Please switch to a desktop device to continue using our application.</p>
          <p className="mt-2">Note that we are working on a mobile version of the application, so stay tuned!</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default RequireDesktop;
