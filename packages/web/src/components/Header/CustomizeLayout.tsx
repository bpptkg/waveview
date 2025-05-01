import { Button, makeStyles, Popover, PopoverProps, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import {
  CheckmarkRegular,
  DismissRegular,
  EyeOffRegular,
  EyeRegular,
  FullScreenMaximizeRegular,
  LayoutColumnOneThirdLeftRegular,
  LayoutColumnTwoRegular,
} from '@fluentui/react-icons';
import { useState } from 'react';
import { useAppStore } from '../../stores/app';

const useNotificationPanelStyles = makeStyles({
  popoverSurface: {
    padding: '0px',
    width: '300px',
    borderRadius: '16px',
  },
});

const CustomizeLayout = () => {
  const styles = useNotificationPanelStyles();
  const [open, setOpen] = useState(false);
  const { isActivityBarVisible, isFullScreen, toggleActivityBar, toggleFullScreen } = useAppStore();

  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  return (
    <Popover open={open} onOpenChange={handleOpenChange} withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content={'Customize Layout'} relationship="label" showDelay={1500}>
          <div className="relative">
            <Button size="small" appearance="transparent" icon={<LayoutColumnTwoRegular fontSize={20} />} />
          </div>
        </Tooltip>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div>
          <div className="flex items-center justify-between p-1 bg-neutral-grey-96 dark:bg-neutral-grey-12 rounded-t-2xl">
            <span className="text-neutral-grey-10 dark:text-neutral-grey-90">Customize Layout</span>
            <Button appearance="transparent" icon={<DismissRegular fontSize={20} />} onClick={() => setOpen(false)} />
          </div>
          <a
            className="flex items-center justify-between p-2 hover:bg-neutral-grey-90 dark:hover:bg-neutral-grey-20 cursor-pointer rounded-2xl"
            onClick={toggleActivityBar}
          >
            <div className="flex items-center gap-2">
              <LayoutColumnOneThirdLeftRegular fontSize={20} />
              <span>Activity Bar</span>
            </div>
            <div className="flex items-center">{isActivityBarVisible ? <EyeRegular fontSize={20} /> : <EyeOffRegular fontSize={20} />}</div>
          </a>
          <a
            className="flex items-center justify-between p-2 hover:bg-neutral-grey-90 dark:hover:bg-neutral-grey-20 cursor-pointer rounded-2xl"
            onClick={toggleFullScreen}
          >
            <div className="flex items-center gap-2">
              <FullScreenMaximizeRegular fontSize={20} />
              <span>Full Screen</span>
            </div>
            <div className="flex items-center">{isFullScreen ? <CheckmarkRegular fontSize={20} /> : null}</div>
          </a>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default CustomizeLayout;
