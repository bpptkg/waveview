import { Button, Image, makeStyles, MenuButton, MenuItem, MenuList, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { Checkmark20Regular, Dismiss16Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationStore } from '../../stores/organization';
import LogoImage from '../Header/LogoImage';

const useOrganizationPickerStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
  },
});

const OrganizationPicker = () => {
  const { currentOrganization, allOrganizations, setCurrentOrganization } = useOrganizationStore();
  const navigate = useNavigate();
  const styles = useOrganizationPickerStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center w-[68px]">
        <a
          className="flex items-center cursor-pointer"
          onClick={() => {
            if (location.pathname !== '/' && location.pathname !== '/picker') {
              navigate('/');
            }
          }}
        >
          <LogoImage />
        </a>
      </div>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger disableButtonEnhancement>
          <MenuButton size="medium" appearance="transparent">
            <span className="font-semibold text-black dark:text-white">{currentOrganization?.name}</span>
          </MenuButton>
        </PopoverTrigger>

        <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold">Switch organization context</span>
              <Button appearance="transparent" icon={<Dismiss16Regular />} onClick={() => setOpen(false)} />
            </div>
            <MenuList>
              {allOrganizations.map((org) => (
                <MenuItem
                  key={org.id}
                  onClick={() => {
                    setCurrentOrganization(org);
                    setOpen(false);
                  }}
                  icon={org.id === currentOrganization?.id ? <Checkmark20Regular /> : undefined}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {org?.avatar && (
                        <div>
                          <div className="w-[24px] h-[24px]">
                            <Image alt={org.name} src={org.avatar} fit="cover" shape="circular" />
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="font-normal">{org.name}</span>
                      </div>
                    </div>
                  </div>
                </MenuItem>
              ))}
            </MenuList>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default OrganizationPicker;
