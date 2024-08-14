import {
  Avatar,
  Divider,
  MenuItem,
  MenuList,
  Popover,
  PopoverProps,
  PopoverSurface,
  PopoverTrigger,
  Toast,
  ToastTitle,
  makeStyles,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  ChevronRight20Regular,
  Info20Regular,
  Person20Regular,
  QuestionCircle20Regular,
  Scales20Regular,
  SignOut20Regular,
  Target20Regular,
  Translate20Regular,
  WeatherMoon20Regular,
} from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useUserStore } from '../../stores/user';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';

const useAccountStyles = makeStyles({
  popoverSuface: {
    width: '240px',
    padding: '8px',
    borderRadius: '16px',
  },
});

type View = 'default' | 'theme' | 'language';

const Account = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { currentLanguage, theme } = useAppStore();
  const styles = useAccountStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => {
    setOpen(data.open || false);
    setView('default');
  };
  const [view, setView] = useState<View>('default');

  const handleViewChange = (view: View) => {
    setView(view);
  };

  const { blacklistToken } = useAuthStore();

  const toasterId = useId('account');
  const { dispatchToast } = useToastController(toasterId);

  const handleLogout = useCallback(() => {
    blacklistToken()
      .then(() => {
        navigate('/login');
      })
      .catch(() => {
        dispatchToast(
          <Toast>
            <ToastTitle>Failed to logout. Please try again later.</ToastTitle>
          </Toast>,
          { intent: 'error' }
        );
      });
  }, [blacklistToken, dispatchToast, navigate]);

  const renderView = () => {
    switch (view) {
      case 'theme':
        return <ThemeSelector onBack={() => handleViewChange('default')} />;
      case 'language':
        return <LanguageSelector onBack={() => handleViewChange('default')} />;
      default:
        return (
          <MenuList>
            <div className="flex items-center gap-2 mb-3">
              <Avatar size={48} color="colorful" name={user?.name ?? user?.username} image={{ src: user?.avatar }} />
              <div className="flex flex-col gap-0">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-sm">@{user?.username}</div>
              </div>
            </div>
            <Divider />
            <MenuItem icon={<Person20Regular />}>Your profile</MenuItem>
            <MenuItem icon={<WeatherMoon20Regular />} secondaryContent={<ChevronRight20Regular />} onClick={() => handleViewChange('theme')}>
              Appearance: {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
            </MenuItem>
            <MenuItem icon={<Translate20Regular />} secondaryContent={<ChevronRight20Regular />} onClick={() => handleViewChange('language')}>
              Language: {currentLanguage.label}
            </MenuItem>
            <Divider />
            <MenuItem
              icon={<QuestionCircle20Regular />}
              onClick={() => {
                navigate('/help');
                setOpen(false);
              }}
            >
              Help
            </MenuItem>
            <MenuItem
              icon={<Target20Regular />}
              onClick={() => {
                window.open('https://github.com/bpptkg/waveview/issues', '_blank');
              }}
            >
              Report an issue
            </MenuItem>
            <MenuItem
              icon={<Scales20Regular />}
              onClick={() => {
                navigate('/terms-of-service');
                setOpen(false);
              }}
            >
              Term of Services
            </MenuItem>
            <MenuItem
              icon={<Info20Regular />}
              onClick={() => {
                navigate('/about');
                setOpen(false);
              }}
            >
              About WaveView
            </MenuItem>
            <Divider />
            <MenuItem icon={<SignOut20Regular />} onClick={handleLogout}>
              Logout
            </MenuItem>
          </MenuList>
        );
    }
  };

  return (
    <div className="flex items-center justify-center w-[68px]">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger disableButtonEnhancement>
          <Avatar color="colorful" name={user?.name ?? user?.username} image={{ src: user?.avatar }} />
        </PopoverTrigger>
        <PopoverSurface tabIndex={-1} className={styles.popoverSuface}>
          {renderView()}
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default Account;
