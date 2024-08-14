import { Button, FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import React from 'react';
import ReactDOM from 'react-dom';
import PickerWorkspace from '../../components/Picker/PickerWorkspace';
import { useAppStore } from '../../stores/app';

export interface EventDetailEditorProps {
  onClose?: () => void;
}

const EventDetailEditor: React.FC<EventDetailEditorProps> = (props) => {
  const { onClose } = props;
  const { darkMode } = useAppStore();

  return ReactDOM.createPortal(
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div className="w-screen h-screen absolute top-0 right-0 bottom-0 left-0 z-[9999] bg-white dark:bg-black flex flex-col">
        <div className="flex items-center justify-end p-1 relative">
          <Button icon={<Dismiss20Regular />} appearance="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex flex-col flex-grow relative">
          <PickerWorkspace />
        </div>
      </div>
    </FluentProvider>,
    document.body
  );
};

export default EventDetailEditor;
