import { Tab, TabList, TabListProps } from '@fluentui/react-components';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CatalogPicker from '../../components/Catalog/CatalogPicker';
import { useOrganizationStore } from '../../stores/organization';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';

const Catalog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(location.pathname);

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    navigate(data.value as string);
  };

  useEffect(() => {
    setSelectedTab(location.pathname);
  }, [location.pathname]);

  const { currentOrganization } = useOrganizationStore();
  const { currentVolcano } = useVolcanoStore();

  return (
    <>
      <TabList onTabSelect={handleTabSelect} selectedValue={selectedTab}>
        <div className="flex justify-between items-center w-full">
          <div className="flex">
            <Tab value={`/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/events`}>Events</Tab>
            <Tab value={`/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/seismicity`}>Seismicity</Tab>
            <Tab value={`/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog/hypocenter`}>Hypocenter</Tab>
          </div>
        </div>
        <div className="flex items-center">
          <CatalogPicker />
        </div>
      </TabList>
      <Outlet />
    </>
  );
};

export default Catalog;
