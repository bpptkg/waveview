import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, makeStyles } from '@fluentui/react-components';
import React from 'react';

export interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface KeyProps {
  children: JSX.Element | string;
}

const useStyles = makeStyles({
  dialog: {
    height: 'fit-content',
    width: 'fit-content',
    maxWidth: '90vw',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    marginTop: '1rem',
    marginBottom: '1rem',
    justifyContent: 'space-between',
  },
  dialogAction: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

const Key: React.FC<KeyProps> = ({ children }) => <span className="border p-1 rounded-md font-mono bg-neutral-grey-98 dark:bg-neutral-grey-4">{children}</span>;

interface ShortcutItemProps {
  children: React.ReactNode;
}
const ShortcutItem: React.FC<ShortcutItemProps> = ({ children }) => <div className="flex gap-1 items-center">{children}</div>;

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ open, onOpenChange }) => {
  const styles = useStyles();

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange?.(data.open)}>
      <DialogSurface className={styles.dialog}>
        <DialogBody>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h1 className="text-md font-bold mb-1">Helicorder</h1>
                <div className="flex flex-col gap-1">
                  <ShortcutItem>
                    <Key>Arrow Up</Key>
                    <span>Shift View Up</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Arrow Down</Key>
                    <span>Shift View Down</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Arrow Left</Key>
                    <span>Previous Selection Window</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Arrow Right</Key>
                    <span>Next Selection Window</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Shift</Key>
                    <Key>Arrow Up</Key> <span>Increase Amplitude</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Shift</Key>
                    <Key>Arrow Down</Key> <span>Decrease Amplitude</span>
                  </ShortcutItem>
                </div>
              </div>
              <div>
                <h1 className="text-md font-bold mb-1">Seismogram</h1>
                <div className="flex flex-col gap-1">
                  <ShortcutItem>
                    <Key>Arrow Left</Key>
                    <span>Scroll Left</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Arrow Right</Key>
                    <span>Scroll Right</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Arrow Up</Key> <span>Increase Amplitude</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Arrow Down</Key> <span>Decrease Amplitude</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Shift</Key>
                    <Key>Arrow Up</Key> <span>Zoom In</span>
                  </ShortcutItem>
                  <ShortcutItem>
                    <Key>Shift</Key>
                    <Key>Arrow Down</Key> <span>Zoom Out</span>
                  </ShortcutItem>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className={styles.dialogAction}>
            <Button appearance="primary" onClick={() => onOpenChange?.(false)}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
