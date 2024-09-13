import { Button, Field, Input, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { Checkmark20Regular, Eye20Regular, EyeOff20Regular } from '@fluentui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../../components/Header/LogoImage';
import { useAuthStore } from '../../stores/auth';
import { CustomError } from '../../types/response';

const WelcomeText = () => {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 dark:text-neutral-grey-84">Volcanic Earthquake</h1>
      <h1 className="text-xl font-bold text-gray-800 dark:text-neutral-grey-84">Profiler System</h1>
      <p className="text-md text-gray-800 dark:text-neutral-grey-84 mt-4">Please login to continue</p>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="inline-flex gap-2 items-center">
      <LogoImage size={32} />
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

const Login = () => {
  const navigate = useNavigate();
  const { fetchToken, hasToken } = useAuthStore();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

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

    try {
      await fetchToken({ username, password });

      navigate('/');
    } catch (error) {
      if (error instanceof CustomError) {
        setError(error.message);
      } else {
        setError('Unknown error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && credentialsFilled) {
      handleLogin();
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (hasToken()) {
      navigate('/');
    }
  }, [hasToken, navigate]);

  return (
    <>
      <title>Login &middot; VEPS</title>
      <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center bg-gradient-matcha dark:bg-gradient-matcha-dark">
        <div className="flex flex-col w-3/5 max-w-5xl min-h-[350px]">
          <div className="flex flex-grow p-4 gap-4 flex-col rounded-2xl bg-white dark:bg-neutral-grey-14">
            <Logo />
            <div className="flex flex-grow flex-col lg:flex-row gap-2">
              <div className="flex-1">
                <WelcomeText />
              </div>

              <div className="flex-1 items-center justify-center flex flex-col">
                <div className="flex flex-col w-full items-center gap-4">
                  {error && <label className="text-wrap text-red-500">{error}</label>}
                  <Field className="w-full">
                    <Input placeholder="Username" type="text" tabIndex={0} value={username} onChange={handleUsernameChange} onKeyDown={handleKeyPress} />
                  </Field>
                  <Field className="w-full">
                    <Input
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      onKeyDown={handleKeyPress}
                      contentAfter={
                        showPassword ? (
                          <Button appearance="transparent" icon={<Eye20Regular />} onClick={toggleShowPassword} />
                        ) : (
                          <Button appearance="transparent" icon={<EyeOff20Regular />} onClick={toggleShowPassword} />
                        )
                      }
                    />
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
    </>
  );
};

export default Login;
