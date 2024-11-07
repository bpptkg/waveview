import { Button, makeStyles, MenuItemRadio, MenuList, MenuProps, Popover, PopoverSurface, PopoverTrigger, Tooltip } from '@fluentui/react-components';
import { CheckmarkRegular, ColumnDoubleCompareRegular } from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';

export interface MethodFilterProps {
  methods?: string[];
  selected?: string;
  onChange?: (method: string) => void;
  onReset?: () => void;
}

const useStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
    borderRadius: '16px',
  },
});

const MethodFilter: React.FC<MethodFilterProps> = ({ methods = [], selected = '', onChange, onReset }) => {
  const styles = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({ methods: [selected] });

  const handleChange: MenuProps['onCheckedValueChange'] = (_, { name, checkedItems }) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
    if (name === 'methods') {
      onChange?.(checkedItems[0]);
    }
    setOpen(false);
  };

  const handleReset = useCallback(() => {
    setCheckedValues({ methods: [] });
    onReset?.();
    setOpen(false);
  }, [onReset]);

  return (
    <Popover trapFocus open={open} onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content={'Filter by method'} relationship="label" showDelay={1500}>
          <Button appearance="transparent" aria-label="Filter by method" icon={<ColumnDoubleCompareRegular fontSize={20} />} />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface className={styles.popoverSurface}>
        <div className="p-2 text-md font-semibold">Filter by Method</div>
        {methods.length ? (
          <MenuList hasCheckmarks checkedValues={checkedValues} onCheckedValueChange={handleChange}>
            {methods.map((item) => (
              <MenuItemRadio key={item} name="methods" checkmark={<CheckmarkRegular fontSize={16} />} value={item}>
                {item}
              </MenuItemRadio>
            ))}
          </MenuList>
        ) : (
          <div className="p-2 text-center">No methods available</div>
        )}
        <div className="flex justify-end mt-2">
          <Button appearance="primary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default MethodFilter;
