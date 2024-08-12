import { Tab, TabList, TabListProps } from '@fluentui/react-components';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CatalogPicker from '../../components/Catalog/CatalogPicker';

const Catalog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    navigate(data.value as string);
  };

  return (
    <div>
      <TabList onTabSelect={handleTabSelect} defaultSelectedValue={location.pathname}>
        <div className="flex justify-between items-center w-full">
          <div className="flex">
            <Tab value="/catalog/events">Events</Tab>
            <Tab value="/catalog/seismicity">Seismicity</Tab>
            <Tab value="/catalog/hypocenter">Hypocenter</Tab>
          </div>
        </div>
        <div className="flex items-center">
          <CatalogPicker />
        </div>
      </TabList>
      <Outlet />
    </div>
  );
};

export default Catalog;
