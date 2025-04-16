import { BUILD_VENDOR } from '../../config/envs';
import AppLauncher from '../Cendana15/AppLauncher';
import IndonesiaIndependenceDay from '../Doodles/IndonesiaIndependenceDay';
import OrganizationPicker from '../Organization/OrganizationPicker';
import VolcanoPicker from '../Volcano/VolcanoPicker';
import Account from './Account';
import ArrowNavigation from './ArrowNavigation';
import JoinedUsers from './JoinedUsers';
import LogoImage from './LogoImage';
import NotificationPanel from './NotificationPanel';
import OfflineIndicator from './OfflineIndicator';
import SearchBox from './SearchBox';
import ToggleFullScreen from './ToggleFullScreen';

const Header = () => {
  return (
    <div className="flex h-[48px] items-center justify-between z-50">
      <div className="flex items-center">
        <div className="flex items-center justify-center w-[68px]">
          <LogoImage size={32} />
        </div>
        <OrganizationPicker />
        <VolcanoPicker />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex">
        <div className="flex items-center gap-2 relative">
          <ArrowNavigation />
          <SearchBox />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <OfflineIndicator />
        <IndonesiaIndependenceDay />
        <JoinedUsers />
        {BUILD_VENDOR === 'cendana15' && <AppLauncher />}
        <ToggleFullScreen />
        <NotificationPanel />
        <Account />
      </div>
    </div>
  );
};

export default Header;
