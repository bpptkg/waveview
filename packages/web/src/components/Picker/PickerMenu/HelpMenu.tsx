import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KeyboardShortcutsDialog from './Help/KeyboardShortcutsDialog';

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  menuPopover: {
    borderRadius: '16px',
  },
});

const HelpMenu = () => {
  const styles = useStyles();
  const [keyboardShortcutsDialogOpen, setKeyboardShortcutsDialogOpen] = useState(false);
  const handleKeyboardShortcutsDialogChange = (open: boolean) => setKeyboardShortcutsDialogOpen(open);

  const handleKeyboardShortcuts = () => setKeyboardShortcutsDialogOpen(true);
  const navigate = useNavigate();
  const handleAbout = () => {
    navigate('/about');
  };

  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button appearance="transparent" size="small" className={styles.btn}>
            Help
          </Button>
        </MenuTrigger>
        <MenuPopover className={styles.menuPopover}>
          <MenuList>
            <MenuItem onClick={handleKeyboardShortcuts}>Keyboard Shortcuts</MenuItem>
            <MenuItem onClick={handleAbout}>About VEPS</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <KeyboardShortcutsDialog open={keyboardShortcutsDialogOpen} onOpenChange={handleKeyboardShortcutsDialogChange} />
    </div>
  );
};

export default HelpMenu;
