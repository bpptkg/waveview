import { Tab, TabList, TabListProps, Tooltip } from '@fluentui/react-components';
import { CopySelectRegular, SoundWaveCircleRegular } from '@fluentui/react-icons';
import { useSidebarStore } from '../../../stores/sidebar';
import { SidebarTab } from '../../../stores/sidebar/types';

const SidebarTabList = () => {
  const { visible, selectedTab, setSelectedTab, setVisible } = useSidebarStore();

  const handleTabSelect: TabListProps['onTabSelect'] = (_, data) => {
    const tab = data.value as SidebarTab;
    if (tab === selectedTab) {
      setVisible(!visible);
    } else {
      setSelectedTab(tab);
      setVisible(true);
    }
  };
  return (
    <div className="relative bg-white dark:bg-neutral-grey-4">
      <TabList vertical size="large" onTabSelect={handleTabSelect} selectedValue={selectedTab} className="absolute right-0 top-0 bottom-0">
        <Tooltip content="Event Editor" relationship="label" showDelay={1500}>
          <Tab value={'eventEditor'} icon={<CopySelectRegular />}></Tab>
        </Tooltip>
        <Tooltip content="Filter Toolbox" relationship="label" showDelay={1500}>
          <Tab value={'filterToolbox'} icon={<SoundWaveCircleRegular />}></Tab>
        </Tooltip>
      </TabList>
    </div>
  );
};

export default SidebarTabList;
