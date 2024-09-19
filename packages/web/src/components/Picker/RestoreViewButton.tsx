import { Button } from '@fluentui/react-components';
import { ArrowReplyRegular } from '@fluentui/react-icons';
import { usePickerStore } from '../../stores/picker';
import { usePickerCallback } from './usePickerCallback';

const RestoreViewButton: React.FC = () => {
  const { handleSeismogramRestoreView } = usePickerCallback();
  const { isExpandMode } = usePickerStore();
  if (!isExpandMode) {
    return null;
  }
  return (
    <div className="absolute top-0 left-0">
      <Button size="small" appearance="transparent" icon={<ArrowReplyRegular />} onClick={handleSeismogramRestoreView} />
    </div>
  );
};

export default RestoreViewButton;
