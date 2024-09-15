import { Button } from '@fluentui/react-components';
import { usePickerCallback } from '../../usePickerCallback';

const PickActivate = () => {
  const { handleSeismogramPickModeChange } = usePickerCallback();
  const handleActivatePickMode = () => {
    handleSeismogramPickModeChange(true);
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 justify-center p-2">
      <h1 className="font-bold text-center text-base">Pick a new event</h1>
      <p className="text-center">Click the button below to activate pick mode and select a new event.</p>
      <Button appearance="primary" onClick={handleActivatePickMode}>
        Activate Pick Mode
      </Button>
    </div>
  );
};

export default PickActivate;
