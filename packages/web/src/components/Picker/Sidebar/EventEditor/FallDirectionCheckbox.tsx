import { Checkbox } from '@fluentui/react-components';
import { useCallback } from 'react';
import { FallDirection } from '../../../../types/observation';

interface FallDirectionCheckboxProps {
  options?: FallDirection[];
  checked?: FallDirection[];
  onChange?: (checked: FallDirection[]) => void;
}

const FallDirectionCheckbox: React.FC<FallDirectionCheckboxProps> = ({ options = [], checked = [], onChange }) => {
  const handleCheck = useCallback(
    (direction: FallDirection) => {
      if (checked.some((d) => d.id === direction.id)) {
        onChange?.(checked.filter((d) => d.id !== direction.id));
      } else {
        onChange?.([...checked, direction]);
      }
    },
    [checked, onChange]
  );

  return (
    <div className="grid grid-cols-2">
      {options.map((direction) => (
        <Checkbox key={direction.id} label={direction.name} checked={checked.some((d) => d.id === direction.id)} onChange={() => handleCheck(direction)} />
      ))}
    </div>
  );
};

export default FallDirectionCheckbox;
