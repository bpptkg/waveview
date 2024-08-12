import CatalogPicker from '../../Catalog/CatalogPicker';
import FileMenu from './FileMenu';
import HelpMenu from './HelpMenu';
import NavigationMenu from './NavigationMenu';
import SignalMenu from './SignalMenu';
import ViewMenu from './ViewMenu';

export interface PickerMenuProps {
  className?: string;
}

const PickerMenu = () => {
  return (
    <div className="flex items-center justify-between h-[32px] relative">
      <div className="flex items-center justify-start">
        <FileMenu />
        <ViewMenu />
        <NavigationMenu />
        <SignalMenu />
        <HelpMenu />
      </div>
      <CatalogPicker />
    </div>
  );
};

export default PickerMenu;
