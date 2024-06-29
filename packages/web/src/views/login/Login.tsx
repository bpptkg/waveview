import { Button, FluentProvider, Input, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, webLightTheme } from '@fluentui/react-components';
import LogoImage from '../../components/Header/LogoImage';
import LogoText from '../../components/Header/LogoText';

const WelcomeText = () => {
  return <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-grey-84">Login to continue</h1>;
};

const Logo = () => {
  return (
    <div className="inline-flex gap-2 items-center">
      <LogoImage size={40} />
      <LogoText />
    </div>
  );
};

const Footer = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between p-2">
      <div>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <MenuButton appearance="transparent" size="small">
              <span className="text-xs text-gray-800 dark:text-white">English</span>
            </MenuButton>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <MenuItem>English</MenuItem>
              <MenuItem>Indonesian</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <a href="/about" className="text-xs  text-gray-800 dark:text-white">
          About
        </a>
        <a href="/terms-of-service" className="text-xs text-gray-800 dark:text-white">
          Terms of Service
        </a>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center bg-[url('/images/gradient.svg')] p-2">
        <div className="flex flex-col lg:w-1/2 min-h-[320px]">
          <div className="flex flex-grow lg:flex-row flex-col p-4 rounded-2xl bg-white dark:bg-neutral-grey-4">
            <div className="flex flex-col flex-grow gap-2">
              <div className="flex flex-col gap-4">
                <Logo />
                <WelcomeText />
              </div>
            </div>

            <div className="flex-grow items-center justify-center flex flex-col">
              <div className="flex flex-col w-full items-center gap-4">
                <Input className="w-full" placeholder="Email" type="email" tabIndex={0} />

                <Input className="w-full" placeholder="Password" type="password" />
                <Button className="w-full" appearance="primary">
                  Login
                </Button>
                <a href="/forgot-password" className="underline underline-offset-1 text-center text-gray-800 dark:text-neutral-grey-84">
                  Forgot your password?
                </a>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </FluentProvider>
  );
};

export default Login;
