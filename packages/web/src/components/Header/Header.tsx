import OrganizationPicker from '../Organization/OrganizationPicker';
import VolcanoPicker from '../Volcano/VolcanoPicker';
import Account from './Account';
import ArrowNavigation from './ArrowNavigation';
import Notification from './Notification';
import SearchBox from './SearchBox';

const Header = () => {
  return (
    <div className="flex h-[48px] items-center justify-between z-50">
      <div className="flex items-center">
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
        <Notification />
        <Account />
      </div>
    </div>
  );
};

export default Header;
