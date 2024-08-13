import { Button, MenuItemRadio, MenuList, MenuProps } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark20Regular } from '@fluentui/react-icons';
import React from 'react';
import { useAppStore } from '../../stores/app';

export interface LanguageSelectorProps {
  onBack?: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = (props) => {
  const { onBack } = props;
  const { setLanguage, supportedLanguages } = useAppStore();
  const [checkedValues, setCheckedValues] = React.useState<Record<string, string[]>>({ language: ['en'] });
  const onChange: MenuProps['onCheckedValueChange'] = (_, { name, checkedItems }) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
    if (name === 'language') {
      const selectedLanguage = supportedLanguages.find((l) => l.value === checkedItems[0]);
      setLanguage(selectedLanguage ?? supportedLanguages[0]);
    }
  };

  return (
    <div className="w-[240px]">
      <div className="flex items-center gap-2">
        <Button appearance="transparent" icon={<ArrowLeft20Regular />} onClick={onBack} />
        <span className="font-semibold">Choose your language</span>
      </div>
      <MenuList hasCheckmarks checkedValues={checkedValues} onCheckedValueChange={onChange}>
        {supportedLanguages.map((language) => (
          <MenuItemRadio key={language.value} checkmark={<Checkmark20Regular />} name="language" value={language.value}>
            {language.label}
          </MenuItemRadio>
        ))}
      </MenuList>
    </div>
  );
};

export default LanguageSelector;
