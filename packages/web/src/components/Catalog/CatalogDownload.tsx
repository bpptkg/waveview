import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  makeStyles,
  Spinner,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { useCatalogStore } from '../../stores/catalog';
import { useEventTypeStore } from '../../stores/eventType';
import { CustomError } from '../../types/response';
import DatePicker from '../DatePicker/DatePicker';

const useStyles = makeStyles({
  dialogSurface: {
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    borderRadius: '16px',
  },
});

export interface CatalogDownloadProps {}

const CatalogDownload: React.FC<CatalogDownloadProps> = () => {
  const toasterId = useId('catalog-download');
  const { dispatchToast } = useToastController(toasterId);
  const eventTypeStore = useEventTypeStore();
  const eventTypes = useMemo(() => eventTypeStore.eventTypes, [eventTypeStore.eventTypes]);

  const styles = useStyles();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(eventTypes.map((item) => item.code));

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<number | undefined>(undefined);
  const handleSelectedDateChange = useCallback((date: number | undefined) => {
    setSelectedDate(date);
  }, []);

  const isValid = useMemo(() => {
    return selectedDate !== undefined && selectedTypes.length > 0;
  }, [selectedDate, selectedTypes.length]);

  const { downloadEvents } = useCatalogStore();

  const handleSelect = useCallback(
    (code: string) => {
      if (selectedTypes.includes(code)) {
        setSelectedTypes(selectedTypes.filter((item) => item !== code));
      } else {
        setSelectedTypes([...selectedTypes, code]);
      }
    },
    [selectedTypes]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedTypes.length === eventTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(eventTypes.map((item) => item.code));
    }
  }, [selectedTypes, eventTypes]);

  const handleDownload = useCallback(async () => {
    if (isValid) {
      try {
        setLoading(true);
        await downloadEvents(selectedDate!, selectedTypes);
        setOpen(false);
        setLoading(false);
      } catch (e: any) {
        const error = e as CustomError;
        setLoading(false);
        dispatchToast(
          <Toast>
            <ToastTitle>{error.message}</ToastTitle>
          </Toast>,
          { intent: 'error' }
        );
      }
    }
  }, [downloadEvents, dispatchToast, selectedDate, selectedTypes, isValid]);

  return (
    <>
      <Tooltip content={'Download'} relationship="label" showDelay={1500}>
        <Button appearance="transparent" icon={<ArrowDownloadRegular fontSize={20} />} onClick={() => setOpen(true)} />
      </Tooltip>
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody>
            <DialogTitle>Download Events</DialogTitle>
            <DialogContent>
              <div>
                <Field label={'Select date'}>
                  <DatePicker selected={selectedDate} onChange={handleSelectedDateChange} />
                </Field>
              </div>
              <div className="mt-1">
                <p>Event types</p>
                <Checkbox checked={selectedTypes.length === eventTypes.length} label={'All'} onChange={() => handleSelectAll()}></Checkbox>
                <div className="grid grid-cols-3 gap-0">
                  {eventTypes.map((item) => (
                    <Checkbox key={item.id} checked={selectedTypes.includes(item.code)} label={item.code} onChange={() => handleSelect(item.code)}></Checkbox>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">The data will be exported in JSON format.</p>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDownload} disabled={!isValid || loading}>
                {loading ? <Spinner label={<span className="text-md"></span>} size="extra-tiny" /> : 'Download'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Toaster toasterId={toasterId} />
    </>
  );
};

export default CatalogDownload;
