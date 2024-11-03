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
  Globe20Regular,
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
import { media } from '../../shared/media';
import { useAppStore } from '../../stores/app';
import { useAuthStore } from '../../stores/auth';
import { useFilterStore } from '../../stores/filter';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { useUserStore } from '../../stores/user';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';
import TimezoneSelector from './TimezoneSelector';

const useAccountStyles = makeStyles({
  popoverSuface: {
    width: 'auto',
    padding: '8px',
    borderRadius: '16px',
  },
});

type View = 'default' | 'theme' | 'language' | 'timezone';

const Account = () => {
  const styles = useAccountStyles();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { currentLanguage, theme, timeZone, useUTC } = useAppStore();
  const { currentOrganization } = useOrganizationStore();

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

  const { resetPickerState } = usePickerStore();
  const { resetFilterState } = useFilterStore();
  const handleLogout = useCallback(() => {
    blacklistToken()
      .then(() => {
        resetPickerState();
        resetFilterState();
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
  }, [blacklistToken, dispatchToast, navigate, resetPickerState, resetFilterState]);

  const renderView = () => {
    switch (view) {
      case 'theme':
        return <ThemeSelector onBack={() => handleViewChange('default')} />;
      case 'language':
        return <LanguageSelector onBack={() => handleViewChange('default')} />;
      case 'timezone':
        return <TimezoneSelector onBack={() => handleViewChange('default')} />;
      default:
        return (
          <MenuList>
            <div className="flex items-center gap-2 mb-3">
              <Avatar size={48} color="colorful" name={user?.name ?? user?.username} image={{ src: media(user?.avatar) }} />
              <div className="flex flex-col gap-0">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-sm">@{user?.username}</div>
              </div>
            </div>
            <Divider />
            <MenuItem
              icon={<Person20Regular />}
              onClick={() => {
                navigate('/profile');
                setOpen(false);
              }}
            >
              Your profile
            </MenuItem>
            <Divider />
            <MenuItem icon={<WeatherMoon20Regular />} secondaryContent={<ChevronRight20Regular />} onClick={() => handleViewChange('theme')}>
              Appearance: {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
            </MenuItem>
            <MenuItem icon={<Translate20Regular />} secondaryContent={<ChevronRight20Regular />} onClick={() => handleViewChange('language')}>
              Language: {currentLanguage.label}
            </MenuItem>
            <MenuItem icon={<Globe20Regular />} secondaryContent={<ChevronRight20Regular />} onClick={() => handleViewChange('timezone')}>
              Timezone: {useUTC ? 'UTC' : timeZone}
            </MenuItem>
            <Divider />
            <MenuItem
              icon={<QuestionCircle20Regular />}
              onClick={() => {
                navigate(`/${currentOrganization?.slug}/help`);
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
              About VEPS
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
          <Avatar color="colorful" name={user?.name ?? user?.username} image={{ src: media(user?.avatar) }} />
        </PopoverTrigger>
        <PopoverSurface tabIndex={-1} className={styles.popoverSuface}>
          {renderView()}
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default Account;
