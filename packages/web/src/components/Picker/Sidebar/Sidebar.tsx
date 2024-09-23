import { Tab, TabList, TabListProps, Tooltip } from '@fluentui/react-components';
import { CopySelectRegular, SoundWaveCircleRegular } from '@fluentui/react-icons';
import React from 'react';
import { useSidebarStore } from '../../../stores/sidebar';
import { SidebarTab } from '../../../stores/sidebar/types';
import EventEditor from './EventEditor/EventEditor';
import FilterToolbox from './FilterToolbox';

const Sidebar: React.FC = () => {
  const { selectedTab, setSelectedTab } = useSidebarStore();

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    const tab = data.value as SidebarTab;
    setSelectedTab(tab);
  };

  return (
    <div className={'flex h-full bg-white dark:bg-neutral-grey-4'}>
      <div className="relative w-full border-l border-r dark:border-transparent">
        <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
          {selectedTab === 'eventEditor' && <EventEditor />}
          {selectedTab === 'filterToolbox' && <FilterToolbox />}
        </div>
      </div>
      <div className="relative bg-white dark:bg-neutral-grey-4">
        <TabList vertical size="medium" onTabSelect={handleTabSelect} selectedValue={selectedTab} className="absolute right-0 top-0 bottom-0">
          <Tooltip content="Event Editor" relationship="label" showDelay={1500}>
            <Tab value={'eventEditor'} icon={<CopySelectRegular />}></Tab>
          </Tooltip>
          <Tooltip content="Filter Toolbox" relationship="label" showDelay={1500}>
            <Tab value={'filterToolbox'} icon={<SoundWaveCircleRegular />}></Tab>
          </Tooltip>
        </TabList>
      </div>
    </div>
  );
};

export default Sidebar;
