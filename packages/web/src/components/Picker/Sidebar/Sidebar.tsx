import React from 'react';
import SpectrogramToolbox from '../../../../../../nocommit/SpectrogramToolbox';
import { useSidebarStore } from '../../../stores/sidebar';
import EventEditor from './EventEditor/EventEditor';
import FilterToolbox from './FilterToolbox';

const Sidebar: React.FC = () => {
  const { selectedTab } = useSidebarStore();

  return (
    <div className={'flex h-full bg-white dark:bg-neutral-grey-4'}>
      <div className="relative w-full border-l border-r dark:border-transparent">
        <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
          {selectedTab === 'pick' && <EventEditor />}
          {selectedTab === 'filter' && <FilterToolbox />}
          {selectedTab === 'spectrogram' && <SpectrogramToolbox />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
