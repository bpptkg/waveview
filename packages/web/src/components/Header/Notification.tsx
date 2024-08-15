import { Button, makeStyles, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { AlertRegular } from '@fluentui/react-icons';
import { useState } from 'react';

const useNotificationStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
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
        <div>This notification popover.</div>
      </PopoverSurface>
    </Popover>
  );
};

export default Notification;
