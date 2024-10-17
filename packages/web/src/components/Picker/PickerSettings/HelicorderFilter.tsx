import { Radio, RadioGroup } from '@fluentui/react-components';
import React, { useCallback, useState } from 'react';
import { formatFilterText } from '../../../shared/formatting';
import { FilterOperationOptions } from '../../../types/filter';

export interface HelicorderFilterProps {
  appliedFilter: FilterOperationOptions | null;
  filterOptions: FilterOperationOptions[];
  onChange?: (appliedFilter: FilterOperationOptions | null) => void;
}

const HelicorderFilter: React.FC<HelicorderFilterProps> = ({ appliedFilter, filterOptions, onChange }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(appliedFilter ? appliedFilter.id : 'none');

  const handleFilterChange = useCallback(
    (id: string) => {
      if (id === 'none') {
        onChange?.(null);
        setSelectedFilter('none');
        return;
      }
      const filter = filterOptions.find((f) => f.id === id);
      setSelectedFilter(id);
      onChange?.(filter ?? null);
    },
    [filterOptions, onChange]
  );

  return (
    <div>
      <p>Choose helicorder filter.</p>
      <RadioGroup layout="vertical" value={selectedFilter} onChange={(_, data) => handleFilterChange(data.value)}>
        <Radio value="none" label="None"></Radio>
        {filterOptions.map((filter) => (
          <Radio key={filter.id} value={filter.id} label={formatFilterText(filter)}></Radio>
        ))}
      </RadioGroup>
    </div>
  );
};

export default HelicorderFilter;
