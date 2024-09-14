import { Button, FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import PickerWorkspace from '../../components/Picker/PickerWorkspace';
import { useAppStore } from '../../stores/app';
import { SeismicEventDetail } from '../../types/event';

export interface EventDetailEditorProps {
  event: SeismicEventDetail;
  onSave?: (event: SeismicEventDetail) => void;
  onClose?: () => void;
}

const EventDetailEditor: React.FC<EventDetailEditorProps> = (props) => {
  const { event, onSave, onClose } = props;
  const { darkMode } = useAppStore();

  const handleSave = useCallback(
    (event: SeismicEventDetail) => {
      onSave?.(event);
    },
    [onSave]
  );

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return ReactDOM.createPortal(
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div className="w-screen h-screen absolute top-0 right-0 bottom-0 left-0 z-[9999] bg-neutral-grey-98 dark:bg-neutral-grey-12 flex flex-col">
        <div className="flex items-center justify-between relative px-2 py-1 bg-white dark:bg-neutral-grey-4">
          <div className="text-md font-semibold">Edit Event</div>
          <Button appearance="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
        <div className="flex flex-col flex-grow relative border-t dark:border-transparent">
          <PickerWorkspace event={event} showHelicorder={false} showEventMarkers={false} onSave={handleSave} onCancel={handleClose} />
        </div>
      </div>
    </FluentProvider>,
    document.getElementById('root')!
  );
};

export default EventDetailEditor;
