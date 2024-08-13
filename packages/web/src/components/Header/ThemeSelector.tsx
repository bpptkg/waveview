import { Button, MenuItemRadio, MenuList, MenuProps } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark20Regular } from '@fluentui/react-icons';
import React from 'react';
import { Theme, useAppStore } from '../../stores/app';

export interface ThemeSelectorProps {
  onBack?: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = (props) => {
  const { onBack } = props;
  const { theme, toggleTheme } = useAppStore();
  const [checkedValues, setCheckedValues] = React.useState<Record<string, string[]>>({ theme: [theme] });
  const onChange: MenuProps['onCheckedValueChange'] = (_, { name, checkedItems }) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
    if (name === 'theme') {
      toggleTheme(checkedItems[0] as Theme);
    }
  };

  return (
    <div className="w-[240px]">
      <div className="flex items-center gap-2">
        <Button appearance="transparent" icon={<ArrowLeft20Regular />} onClick={onBack} />
        <span className="font-semibold">Appearance</span>
      </div>
      <MenuList hasCheckmarks checkedValues={checkedValues} onCheckedValueChange={onChange}>
        <MenuItemRadio checkmark={<Checkmark20Regular />} name="theme" value="light">
          Light
        </MenuItemRadio>
        <MenuItemRadio checkmark={<Checkmark20Regular />} name="theme" value="dark">
          Dark
        </MenuItemRadio>
        <MenuItemRadio checkmark={<Checkmark20Regular />} name="theme" value="system">
          Auto
        </MenuItemRadio>
      </MenuList>
    </div>
  );
};

export default ThemeSelector;
