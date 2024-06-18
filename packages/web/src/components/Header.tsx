import Account from './Account';
import ArrowNavigation from './ArrowNavigation';
import Logo from './Logo';
import LogoText from './LogoText';
import Notification from './Notification';
import SearchBox from './SearchBox';

const Header = () => {
  return (
    <div className="flex w-full h-[48px] items-center justify-between px-2 border-b">
      <div className='flex items-center gap-2'>
        <Logo />
        <LogoText />
      </div>
      <div className='flex items-center gap-1'>
        <ArrowNavigation />
        <SearchBox />
      </div>
      <div className='flex items-center gap-1'>
        <Notification />
        <Account />
      </div>
    </div>
  );
};

export default Header;
