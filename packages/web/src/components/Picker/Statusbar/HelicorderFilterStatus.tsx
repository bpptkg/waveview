import { Tooltip } from '@fluentui/react-components';
import { formatFilterText } from '../../../shared/formatting';
import { usePickerStore } from '../../../stores/picker';

const HelicorderFilterStatus = () => {
  const { helicorderFilter } = usePickerStore();
  if (!helicorderFilter) {
    return null;
  }
  return (
    <Tooltip
      content={<span className="text-nowrap">{`Helicorder Filter: ${formatFilterText(helicorderFilter)}`}</span>}
      relationship="description"
      showDelay={1500}
    >
      <span className="text-xs dark:text-neutral-grey-84 px-1">H: {formatFilterText(helicorderFilter)}</span>
    </Tooltip>
  );
};

export default HelicorderFilterStatus;
