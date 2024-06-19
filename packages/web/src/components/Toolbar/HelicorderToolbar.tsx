import {
  Button,
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
} from '@fluentui/react-components';
import {
  AutoFitHeight20Regular,
  ChevronDoubleDown20Regular,
  ChevronDown20Regular,
  ChevronDownUp20Regular,
  ChevronUp20Regular,
  ChevronUpDown20Regular,
  MoreHorizontal24Filled,
  Search20Regular,
} from '@fluentui/react-icons';

const HelicorderToolbar = () => (
  <div className="bg-white mx-2 drop-shadow rounded">
    <Toolbar aria-label="Helicorder Toolbar">
      <MenuButton appearance="primary" size="medium">
        Helicorder
      </MenuButton>
      <Button appearance="transparent" icon={<Search20Regular />} size="small" aria-label="Select Channel ID">
        VG.MEPAS.00.HHZ
      </Button>
      <MenuButton appearance="transparent" size="small" aria-label="Select Duration">
        12h
      </MenuButton>
      <MenuButton appearance="transparent" size="small" aria-label="Select Interval">
        30m
      </MenuButton>
      <ToolbarDivider />
      <ToolbarButton aria-label="Shift View Down" icon={<ChevronDown20Regular />} />
      <ToolbarButton aria-label="Shift View Up" icon={<ChevronUp20Regular />} />
      <ToolbarButton aria-label="Shift View to Now" icon={<ChevronDoubleDown20Regular />} />
      <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} />
      <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} />
      <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} />
      <ToolbarDivider />
      <Switch label="Show Event" />
      <ToolbarDivider />
      <Menu>
        <MenuTrigger>
          <ToolbarButton aria-label="More" icon={<MoreHorizontal24Filled />} />
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>New </MenuItem>
            <MenuItem>New Window</MenuItem>
            <MenuItem disabled>Open File</MenuItem>
            <MenuItem>Open Folder</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Toolbar>
  </div>
);

export default HelicorderToolbar;
