import { BUILD_VENDOR } from '../../config/envs';
import AppLauncher from '../Cendana15/AppLauncher';
import OrganizationPicker from '../Organization/OrganizationPicker';
import VolcanoPicker from '../Volcano/VolcanoPicker';
import Account from './Account';
import ArrowNavigation from './ArrowNavigation';
import LogoImage from './LogoImage';
import NotificationPanel from './NotificationPanel';
import OfflineIndicator from './OfflineIndicator';
import SearchBox from './SearchBox';

const Header = () => {
  return (
    <div className="flex h-[48px] items-center justify-between z-50">
      <div className="flex items-center">
        <div className="flex items-center justify-center w-[68px]">
          <LogoImage />
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
        {BUILD_VENDOR === 'cendana15' && <AppLauncher />}
        <NotificationPanel />
        <Account />
      </div>
    </div>
  );
};

export default Header;
