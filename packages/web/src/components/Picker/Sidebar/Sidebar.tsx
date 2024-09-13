import { Tab, TabList, TabListProps } from '@fluentui/react-components';
import { CopySelectRegular, SoundWaveCircleRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';
import SpectrogramToolbox from '../../../../../../nocommit/SpectrogramToolbox';
import EventEditor from './EventEditor/EventEditor';
import FilterToolbox from './FilterToolbox';

const Sidebar: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('pick');
  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    setSelectedTab(data.value as string);
  };

  return (
    <div className="flex h-full bg-white dark:bg-neutral-grey-4">
      <div className="relative w-full border-l border-r dark:border-transparent">
        <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
          {selectedTab === 'pick' && <EventEditor />}
          {selectedTab === 'filter' && <FilterToolbox />}
          {selectedTab === 'spectrogram' && <SpectrogramToolbox />}
        </div>
      </div>
      <div className="relative">
        <TabList vertical size="large" onTabSelect={handleTabSelect} selectedValue={selectedTab}>
          <Tab value={'pick'} icon={<CopySelectRegular />}></Tab>
          <Tab value={'filter'} icon={<SoundWaveCircleRegular />}></Tab>
        </TabList>
      </div>
    </div>
  );
};

export default Sidebar;
