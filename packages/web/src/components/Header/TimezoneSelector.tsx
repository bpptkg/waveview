import { Button, MenuItemRadio, MenuList, MenuProps } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark20Regular } from '@fluentui/react-icons';
import React from 'react';
import { useAppStore } from '../../stores/app';

export interface TimezoneSelectorProps {
  onBack?: () => void;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = (props) => {
  const { onBack } = props;
  const { setUseUTC, timeZone, useUTC } = useAppStore();

  const options = [
    { label: timeZone, value: 'local' },
    { label: 'UTC', value: 'utc' },
  ];
  const [checkedValues, setCheckedValues] = React.useState<Record<string, string[]>>({ timezone: [useUTC ? 'utc' : 'local'] });
  const onChange: MenuProps['onCheckedValueChange'] = (_, { name, checkedItems }) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
    if (name === 'timezone') {
      setUseUTC(checkedItems[0] === 'utc');
    }
  };

  return (
    <div className="w-[240px]">
      <div className="flex items-center gap-2">
        <Button appearance="transparent" icon={<ArrowLeft20Regular />} onClick={onBack} />
        <span className="font-semibold">Choose the timezone</span>
      </div>
      <MenuList hasCheckmarks checkedValues={checkedValues} onCheckedValueChange={onChange}>
        {options.map((opt) => (
          <MenuItemRadio key={opt.value} checkmark={<Checkmark20Regular />} name="timezone" value={opt.value}>
            {opt.label}
          </MenuItemRadio>
        ))}
      </MenuList>
    </div>
  );
};

export default TimezoneSelector;
