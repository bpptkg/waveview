import CatalogPicker from '../../Catalog/CatalogPicker';
import FileMenu from './FileMenu';
import HelpMenu from './HelpMenu';
import LayoutSelector from './LayoutSelector';
import NavigationMenu from './NavigationMenu';
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
        <HelpMenu />
      </div>
      <div className="flex items-center gap-2 mr-1">
        <LayoutSelector />
        <CatalogPicker />
      </div>
    </div>
  );
};

export default PickerMenu;
