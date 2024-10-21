import { Radio, RadioGroup } from '@fluentui/react-components';
import React from 'react';

export interface SelectionWindowProps {
  value: string;
  onChange?: (value: string) => void;
}

const SelectionWindow: React.FC<SelectionWindowProps> = ({ value, onChange }) => {
  return (
    <div>
      <p>Choose helicorder selection window.</p>
      <RadioGroup layout="vertical" value={value} onChange={(_, data) => onChange?.(data.value)}>
        <Radio value="3" label="3 minutes" />
        <Radio value="5" label="5 minutes" />
        <Radio value="10" label="10 minutes" />
      </RadioGroup>
    </div>
  );
};

export default SelectionWindow;
