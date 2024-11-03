import { Button, Image, makeStyles, MenuButton, MenuItem, MenuList, Popover, PopoverProps, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { CheckmarkRegular, Dismiss16Regular } from '@fluentui/react-icons';
import { useCallback, useState } from 'react';
import { media } from '../../shared/media';
import { useOrganizationStore } from '../../stores/organization';

const useOrganizationPickerStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
  },
});

const OrganizationPicker = () => {
  const { currentOrganization, allOrganizations } = useOrganizationStore();
  const styles = useOrganizationPickerStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  const handleOrganizationChange = useCallback(
    (slug: string) => {
      const organization = allOrganizations.find((o) => o.slug === slug);
      if (organization && organization.slug !== currentOrganization?.slug) {
        const url = `/${organization.slug}`;
        window.location.href = url;
      }
      setOpen(false);
    },
    [currentOrganization, allOrganizations]
  );

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger disableButtonEnhancement>
          <MenuButton size="medium" appearance="transparent">
            <span className="font-normal text-black dark:text-white">{currentOrganization?.name}</span>
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
                  onClick={() => handleOrganizationChange(org.slug)}
                  icon={org.id === currentOrganization?.id ? <CheckmarkRegular /> : <CheckmarkRegular color="transparent" />}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {org?.avatar && (
                        <div>
                          <div className="w-[24px] h-[24px]">
                            <Image alt={org.name} src={media(org.avatar)} fit="cover" shape="circular" />
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
