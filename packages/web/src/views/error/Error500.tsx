import { Link } from '@fluentui/react-components';

const Error500 = () => {
  return (
    <>
      <title>Server Error - VEPS</title>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center p-2 fixed top-0 left-0 bg-gradient-matcha dark:bg-gradient-matcha-dark">
        <div className="flex flex-col gap-4 w-1/2 p-4 rounded-2xl bg-white dark:bg-neutral-grey-14 overflow-auto max-h-[90%] h-auto">
          <div className="flex flex-col gap-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-grey-84">Server Error</h1>
            <p className="text-gray-800 dark:text-neutral-grey-84">
              An unexpected error occurred. Please try again later. If the problem persists, please contact support.
            </p>
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Error500;
