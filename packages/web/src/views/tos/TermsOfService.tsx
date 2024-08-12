import { FluentProvider, Link, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { useEffect } from 'react';
import { useAppStore } from '../../stores/app';

const TermsOfService = () => {
  const { darkMode, theme, toggleTheme } = useAppStore();

  useEffect(() => {
    toggleTheme(theme);
  }, [theme, toggleTheme]);

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center p-2 fixed top-0 left-0 bg-gradient-matcha dark:bg-gradient-matcha-dark">
        <div className="flex flex-col gap-4 w-1/2 p-4 rounded-2xl bg-white dark:bg-neutral-grey-14 overflow-auto max-h-[90%] h-auto">
          <div className="flex flex-col gap-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-grey-84">Terms of Service</h1>
            <p className="text-gray-800 dark:text-neutral-grey-84">By using this service, you agree to the following terms and conditions:</p>

            <h2 className="font-bold">1. Acceptance of Terms</h2>
            <p>By accessing or using our service, you agree to be bound by these terms and all applicable laws and regulations.</p>

            <h2 className="font-bold">2. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-800 dark:text-neutral-grey-84">
              <li>Do not use this service for any illegal activities.</li>
              <li>Do not attempt to hack or disrupt the service.</li>
              <li>Do not share your account with others.</li>
              <li>Do not attempt to reverse-engineer the service.</li>
            </ul>

            <h2 className="font-bold">3. Copyright and Intellectual Property</h2>
            <p>All content provided on the service is the intellectual property of the service provider or its licensors and is protected by copyright laws.</p>

            <h2 className="font-bold">4. Disclaimers and Limitation of Liability</h2>
            <p>
              The service is provided on an "as is" and "as available" basis. The service provider is not liable for any damages arising from the use of the
              service.
            </p>

            <h2 className="font-bold">5. User Content</h2>
            <p>Users are responsible for the content they upload or share on the service and must have the necessary rights to such content.</p>

            <h2 className="font-bold">6. Termination</h2>
            <p>The service provider reserves the right to terminate your access to the service at any time without notice for any reason whatsoever.</p>

            <h2 className="font-bold">7. Dispute Resolution</h2>
            <p>Any disputes arising out of the use of the service will be governed by the laws of the service provider's jurisdiction.</p>

            <h2 className="font-bold">8. Changes to Terms</h2>
            <p>
              The service provider reserves the right to modify these terms at any time. Your continued use of the service after such changes constitutes your
              acceptance of the new terms.
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

export default TermsOfService;
