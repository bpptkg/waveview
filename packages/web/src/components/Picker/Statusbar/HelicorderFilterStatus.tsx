import { Tooltip } from '@fluentui/react-components';
import { formatFilterText } from '../../../shared/formatting';
import { usePickerStore } from '../../../stores/picker';

const HelicorderFilterStatus = () => {
  const { helicorderFilter } = usePickerStore();
  if (!helicorderFilter) {
    return null;
  }
  return (
    <Tooltip content={`Current helicorder filter: ${formatFilterText(helicorderFilter)}`} relationship="description" showDelay={1500}>
      <div className="flex items-center gap-1">
        <span className="text-xs dark:text-neutral-grey-84">H: {formatFilterText(helicorderFilter)}</span>
      </div>
    </Tooltip>
  );
};

export default HelicorderFilterStatus;
