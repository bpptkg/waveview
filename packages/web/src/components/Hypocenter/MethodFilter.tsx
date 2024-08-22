import { Button, MenuItemRadio, MenuList, MenuProps, Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { CheckmarkRegular, ColumnDoubleCompareRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';

export interface MethodFilterProps {
  methods?: string[];
  selected?: string;
  onChange?: (method: string) => void;
}

const MethodFilter: React.FC<MethodFilterProps> = ({ methods = [], selected = '', onChange }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({ methods: [selected] });

  const handleChange: MenuProps['onCheckedValueChange'] = (_, { name, checkedItems }) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
    if (name === 'methods') {
      onChange?.(checkedItems[0]);
    }
    setOpen(false);
  };

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content={'Filter by method'} relationship="label" showDelay={1500}>
          <Button appearance="transparent" aria-label="Filter by method" icon={<ColumnDoubleCompareRegular fontSize={20} />} />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface>
        <MenuList hasCheckmarks checkedValues={checkedValues} onCheckedValueChange={handleChange}>
          {methods.map((item) => (
            <MenuItemRadio key={item} name="methods" checkmark={<CheckmarkRegular fontSize={16} />} value={item}>
              {item}
            </MenuItemRadio>
          ))}
        </MenuList>
      </PopoverSurface>
    </Popover>
  );
};

export default MethodFilter;
