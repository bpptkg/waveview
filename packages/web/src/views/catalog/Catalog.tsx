import { Tab, TabList, TabListProps } from '@fluentui/react-components';
import { Outlet, useNavigate } from 'react-router-dom';

const Catalog = () => {
  const navigate = useNavigate();

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    navigate(data.value as string);
  };

  return (
    <div>
      <TabList onTabSelect={handleTabSelect}>
        <Tab value="/catalog/events">Events</Tab>
        <Tab value="/catalog/seismicity">Seismicity</Tab>
        <Tab value="/catalog/hypocenter">Hypocenter</Tab>
      </TabList>
      <Outlet />
    </div>
  );
};

export default Catalog;
