import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles } from '@fluentui/react-components';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationStore } from '../../../stores/organization';
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
  const navigate = useNavigate();
  const { currentOrganization } = useOrganizationStore();

  const [keyboardShortcutsDialogOpen, setKeyboardShortcutsDialogOpen] = useState(false);
  const handleKeyboardShortcutsDialogChange = (open: boolean) => setKeyboardShortcutsDialogOpen(open);
  const handleKeyboardShortcuts = useCallback(() => setKeyboardShortcutsDialogOpen(true), []);

  const handleHelpCenter = useCallback(() => {
    const helpUrl = `/${currentOrganization?.slug}/help`;
    navigate(helpUrl);
  }, [navigate, currentOrganization]);

  const handleAbout = useCallback(() => {
    navigate('/about');
  }, [navigate]);

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
            <MenuItem onClick={handleHelpCenter}>Help Center</MenuItem>
            <MenuItem onClick={handleAbout}>About VEPS</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <KeyboardShortcutsDialog open={keyboardShortcutsDialogOpen} onOpenChange={handleKeyboardShortcutsDialogChange} />
    </div>
  );
};

export default HelpMenu;
