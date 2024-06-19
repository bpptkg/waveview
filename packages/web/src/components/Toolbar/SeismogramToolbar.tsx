import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Switch,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
} from '@fluentui/react-components';
import {
  Add20Regular,
  AutoFitHeight20Regular,
  ChevronDoubleRight20Regular,
  ChevronDownUp20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUpDown20Regular,
  MoreHorizontal24Filled,
  ZoomIn20Regular,
  ZoomOut20Regular,
} from '@fluentui/react-icons';
import PickIcon from '../Icons/PickIcon';
import ToolbarContextSwicher from './ToolbarContextSwicher';

const SeismogramToolbar = () => (
  <div className="bg-white mx-2 drop-shadow rounded">
    <Toolbar aria-label="Seismogram Toolbar">
      <ToolbarContextSwicher />
      <ToolbarDivider />
      <ToolbarButton aria-label="Add Channel" icon={<Add20Regular />} />
      <ToolbarDivider />
      <ToolbarButton aria-label="Zoom In" icon={<ZoomIn20Regular />} />
      <ToolbarButton aria-label="Zoom Out" icon={<ZoomOut20Regular />} />
      <ToolbarButton aria-label="Scroll Left" icon={<ChevronLeft20Regular />} />
      <ToolbarButton aria-label="Scroll Right" icon={<ChevronRight20Regular />} />
      <ToolbarButton aria-label="Scroll to Now" icon={<ChevronDoubleRight20Regular />} />
      <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} />
      <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} />
      <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} />
      <ToolbarDivider />
      <ToolbarToggleButton aria-label="Underline" icon={<PickIcon />} name="textOptions" value="underline" appearance="subtle" />
      <Menu>
        <MenuTrigger>
          <MenuButton appearance="transparent" size="small" aria-label="Select Component">
            Z
          </MenuButton>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>E</MenuItem>
            <MenuItem>N</MenuItem>
            <MenuItem>Z</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <ToolbarDivider />
      <Switch label="Show Event" />
      <ToolbarDivider />
      <Menu>
        <MenuTrigger>
          <ToolbarButton aria-label="More" icon={<MoreHorizontal24Filled />} />
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>More</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Toolbar>
  </div>
);

export default SeismogramToolbar;
