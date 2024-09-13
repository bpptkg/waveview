import { Button } from '@fluentui/react-components';
import { usePickerCallback } from '../../usePickerCallback';

const PickActivate = () => {
  const { handleSeismogramPickModeChange } = usePickerCallback();
  const handleActivatePickMode = () => {
    handleSeismogramPickModeChange(true);
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 justify-start p-2">
      <h1 className="font-bold text-center text-base">Pick a new event</h1>
      <p className="text-center">To pick new event, click the button to activate pick mode.</p>
      <Button appearance="primary" onClick={handleActivatePickMode}>
        Pick a new event
      </Button>
    </div>
  );
};

export default PickActivate;
