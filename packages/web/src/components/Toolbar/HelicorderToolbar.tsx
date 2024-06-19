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
  Calendar20Regular,
  ChevronDoubleDown20Regular,
  ChevronDown20Regular,
  ChevronDownUp20Regular,
  ChevronUp20Regular,
  ChevronUpDown20Regular,
  MoreHorizontal24Filled,
  Search20Regular,
} from '@fluentui/react-icons';
import ToolbarContextSwicher from './ToolbarContextSwicher';

const HelicorderToolbar = () => (
  <div className="bg-white mx-2 drop-shadow rounded">
    <Toolbar aria-label="Helicorder Toolbar">
      <ToolbarContextSwicher />
      <ToolbarDivider />
      <Button appearance="transparent" icon={<Search20Regular />} size="small" aria-label="Select Channel ID">
        VG.MEPAS.00.HHZ
      </Button>
      <Menu>
        <MenuTrigger>
          <MenuButton appearance="transparent" size="small" aria-label="Select Duration">
            12h
          </MenuButton>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>3h</MenuItem>
            <MenuItem>6h</MenuItem>
            <MenuItem>12h</MenuItem>
            <MenuItem>1d</MenuItem>
            <MenuItem>2d</MenuItem>
            <MenuItem>3d</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Menu>
        <MenuTrigger>
          <MenuButton appearance="transparent" size="small" aria-label="Select Interval">
            30m
          </MenuButton>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>10m</MenuItem>
            <MenuItem>15m</MenuItem>
            <MenuItem>30m</MenuItem>
            <MenuItem>1h</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <ToolbarDivider />
      <ToolbarButton aria-label="Shift View Down" icon={<ChevronDown20Regular />} />
      <ToolbarButton aria-label="Shift View Up" icon={<ChevronUp20Regular />} />
      <ToolbarButton aria-label="Shift View to Now" icon={<ChevronDoubleDown20Regular />} />
      <ToolbarButton aria-label="Change Offset Date" icon={<Calendar20Regular />} />
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
            <MenuItem>More</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Toolbar>
  </div>
);

export default HelicorderToolbar;
