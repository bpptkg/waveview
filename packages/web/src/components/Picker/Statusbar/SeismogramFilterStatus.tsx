import { AlignSpaceAroundVerticalRegular } from '@fluentui/react-icons';
import { formatFilterText } from '../../../shared/formatting';
import { useFilterStore } from '../../../stores/filter';

const SeismogramFilterStatus = () => {
  const { appliedFilter } = useFilterStore();
  if (!appliedFilter) {
    return null;
  }
  return (
    <div className="flex items-center gap-1">
      <AlignSpaceAroundVerticalRegular fontSize={12} />
      <span className="text-xs dark:text-neutral-grey-84">{formatFilterText(appliedFilter)}</span>
    </div>
  );
};

export default SeismogramFilterStatus;
