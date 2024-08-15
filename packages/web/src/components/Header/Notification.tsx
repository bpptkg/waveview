import { Button, Divider, makeStyles, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { AlertRegular } from '@fluentui/react-icons';
import { useState } from 'react';

const useNotificationStyles = makeStyles({
  popoverSurface: {
    padding: '0px',
    width: '300px',
  },
});

const Notification = () => {
  const styles = useNotificationStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  return (
    <Popover open={open} onOpenChange={handleOpenChange} withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Button size="small" appearance="transparent" icon={<AlertRegular fontSize={20} />} />
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div>
          <div className="flex items-center justify-start">
            <h2 className="text-md font-semibold p-2">Notifications</h2>
          </div>

          <Divider />

          <div className="p-2">
            <span>No notification</span>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default Notification;
