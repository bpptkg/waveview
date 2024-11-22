import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle } from '@fluentui/react-components';
import React from 'react';

export interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface KeyProps {
  children: JSX.Element | string;
}

const Key: React.FC<KeyProps> = ({ children }) => <span className="border p-1 rounded-md font-mono bg-neutral-grey-98 dark:bg-neutral-grey-4">{children}</span>;

interface ShortcutItemProps {
  children: React.ReactNode;
}
const ShortcutItem: React.FC<ShortcutItemProps> = ({ children }) => <div className="flex gap-1 items-center">{children}</div>;

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange?.(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogContent>
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
            <div className="mt-2">
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
                <ShortcutItem>
                  <Key>T</Key>
                  <span>Toggle Signal</span>
                </ShortcutItem>
                <ShortcutItem>
                  <Key>S</Key>
                  <span>Toggle Spectrogram</span>
                </ShortcutItem>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
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
