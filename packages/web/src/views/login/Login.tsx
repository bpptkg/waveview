import {
  Button,
  Field,
  FluentProvider,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { Checkmark20Regular } from '@fluentui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../../components/Header/LogoImage';
import LogoText from '../../components/Header/LogoText';
import { baseUrl } from '../../services/api';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useUserStore } from '../../stores/user';

const WelcomeText = () => {
  return <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-grey-84">Login to continue</h1>;
};

const Logo = () => {
  return (
    <div className="inline-flex gap-2 items-center">
      <LogoImage size={32} />
      <LogoText />
    </div>
  );
};

const Footer = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between p-2">
      <div>
        <Menu hasIcons>
          <MenuTrigger disableButtonEnhancement>
            <MenuButton appearance="transparent" size="small">
              English
            </MenuButton>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <MenuItem icon={<Checkmark20Regular />}>English</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div className="flex flex-col lg:flex-row items-center lg:gap-4">
        <a href="/about" className="text-xs  text-gray-800 dark:text-neutral-grey-84">
          About
        </a>
        <a href="/terms-of-service" className="text-xs text-gray-800 dark:text-neutral-grey-84">
          Terms of Service
        </a>
      </div>
    </div>
  );
};

interface LoginSucessResponse {
  access: string;
  refresh: string;
}

const Login = () => {
  const { darkMode, theme, toggleTheme } = useAppStore();

  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { fetchUser } = useUserStore();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const credentialsFilled = useMemo(() => {
    return username.length > 0 && password.length > 0;
  }, [username, password]);

  const handleLogin = async () => {
    setLoading(true);

    const url = `${baseUrl}/api/v1/login/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('The username and password you entered did not match our records. Please double-check and try again.');
      }

      const token: LoginSucessResponse = await response.json();
      setToken(token);

      await fetchUser().then(() => {
        navigate('/');
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    toggleTheme(theme);
  }, [theme, toggleTheme]);

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center bg-brand-hosts-150 dark:dark:bg-neutral-grey-4">
        <div className="flex flex-col lg:w-1/2 min-h-[320px]">
          <div className="flex flex-grow p-4 gap-4 flex-col rounded-2xl bg-white dark:bg-neutral-grey-14">
            <Logo />
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1">
                <WelcomeText />
              </div>

              <div className="flex-1 items-center justify-center flex flex-col">
                <div className="flex flex-col w-full items-center gap-4">
                  {error && <label className="text-wrap text-red-500">{error}</label>}
                  <Field className="w-full">
                    <Input placeholder="Username" type="text" tabIndex={0} value={username} onChange={handleUsernameChange} />
                  </Field>
                  <Field className="w-full">
                    <Input placeholder="Password" type="password" value={password} onChange={handlePasswordChange} />
                  </Field>
                  <Button className="w-full" appearance="primary" onClick={handleLogin} disabled={loading || !credentialsFilled}>
                    Login
                  </Button>
                  <a href="/forgot-password" className="underline underline-offset-1 text-center text-gray-800 dark:text-neutral-grey-84">
                    Forgot your password?
                  </a>
                </div>
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
