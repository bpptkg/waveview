import { useInventoryStore } from '../../stores/inventory';
import { usePickerStore } from '../../stores/picker';
import { usePickerContext } from './PickerContext';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { usePickerCallback } from './usePickerCallback';

const PickerToolbar = () => {
  const { channelId, helicorderDuration, helicorderInterval, offsetDate, seismogramToolbarCheckedValues, selectedChart, showEvent } = usePickerStore();
  const { channels } = useInventoryStore();

  const {
    handleHelicorderShiftViewUp,
    handleHelicorderShiftViewDown,
    handleHelicorderShiftViewToNow,
    handleHelicorderIncreaseAmplitude,
    handleHelicorderDecreaseAmplitude,
    handleHelicorderResetAmplitude,
    handleHelicorderChannelChange,
    handleHelicorderChangeInterval,
    handleHelicorderChangeDuration,
    handleHelicorderSelectOffsetDate,
    handleHelicorderRefreshData,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramShowEvent,
    handleSeismogramCheckValueChange,
    handleSeismogramSpectrogramChange,
    handleSeismogramSignalChange,
  } = usePickerCallback();

  const { props } = usePickerContext();
  const { showHelicorder } = props;

  return (
    <>
      {selectedChart === 'helicorder' && showHelicorder && (
        <HelicorderToolbar
          channelId={channelId}
          interval={helicorderInterval}
          duration={helicorderDuration}
          showEvent={showEvent}
          offsetDate={new Date(offsetDate)}
          availableChannels={channels()}
          onShiftViewUp={handleHelicorderShiftViewUp}
          onShiftViewDown={handleHelicorderShiftViewDown}
          onShiftViewToNow={handleHelicorderShiftViewToNow}
          onIncreaseAmplitude={handleHelicorderIncreaseAmplitude}
          onDecreaseAmplitude={handleHelicorderDecreaseAmplitude}
          onResetAmplitude={handleHelicorderResetAmplitude}
          onChannelChange={handleHelicorderChannelChange}
          onIntervalChange={handleHelicorderChangeInterval}
          onDurationChange={handleHelicorderChangeDuration}
          onOffsetDateChange={handleHelicorderSelectOffsetDate}
          onShowEventChange={handleSeismogramShowEvent}
          onRefreshData={handleHelicorderRefreshData}
        />
      )}

      {selectedChart === 'seismogram' && (
        <SeismogramToolbar
          showEvent={showEvent}
          checkedValues={seismogramToolbarCheckedValues}
          onZoomIn={handleSeismogramZoomIn}
          onZoomOut={handleSeismogramZoomOut}
          onScrollLeft={handleSeismogramScrollLeft}
          onScrollRight={handleSeismogramScrollRight}
          onIncreaseAmplitude={handleSeismogramIncreaseAmplitude}
          onDecreaseAmplitude={handleSeismogramDecreaseAmplitude}
          onResetAmplitude={handleSeismogramResetAmplitude}
          onShowEventChange={handleSeismogramShowEvent}
          onCheckedValueChange={handleSeismogramCheckValueChange}
          onSpectrogramChange={handleSeismogramSpectrogramChange}
          onSignalChange={handleSeismogramSignalChange}
        />
      )}
    </>
  );
};

export default PickerToolbar;
