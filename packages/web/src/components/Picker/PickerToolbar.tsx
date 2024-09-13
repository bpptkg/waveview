import { useInventoryStore } from '../../stores/inventory';
import { usePickerStore } from '../../stores/picker';
import { usePickerContext } from './PickerContext';
import HelicorderToolbar from './Toolbar/HelicorderToolbar';
import SeismogramToolbar from './Toolbar/SeismogramToolbar';
import { usePickerCallback } from './usePickerCallback';

const PickerToolbar = () => {
  const {
    channelId,
    component,
    helicorderDuration,
    helicorderInterval,
    isExpandMode,
    offsetDate,
    seismogramToolbarCheckedValues,
    selectedChart,
    showEvent,
    selectedChannels,
  } = usePickerStore();

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
    handleSeismogramChannelAdd,
    handleSeismogramZoomIn,
    handleSeismogramZoomOut,
    handleSeismogramScrollLeft,
    handleSeismogramScrollRight,
    handleSeismogramScrollToNow,
    handleSeismogramIncreaseAmplitude,
    handleSeismogramDecreaseAmplitude,
    handleSeismogramResetAmplitude,
    handleSeismogramComponentChange,
    handleSeismogramShowEvent,
    handleSeismogramCheckValueChange,
    handleSeismogramSpectrogramChange,
  } = usePickerCallback();

  const { props } = usePickerContext();
  const { showHelicorder, showSeismogram } = props;

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
        />
      )}

      {selectedChart === 'seismogram' && showSeismogram && (
        <SeismogramToolbar
          showEvent={showEvent}
          checkedValues={seismogramToolbarCheckedValues}
          isExpandMode={isExpandMode}
          availableChannels={channels()}
          selectedChannels={selectedChannels}
          component={component}
          onChannelAdd={handleSeismogramChannelAdd}
          onZoomIn={handleSeismogramZoomIn}
          onZoomOut={handleSeismogramZoomOut}
          onScrollLeft={handleSeismogramScrollLeft}
          onScrollRight={handleSeismogramScrollRight}
          onScrollToNow={handleSeismogramScrollToNow}
          onIncreaseAmplitude={handleSeismogramIncreaseAmplitude}
          onDecreaseAmplitude={handleSeismogramDecreaseAmplitude}
          onResetAmplitude={handleSeismogramResetAmplitude}
          onShowEventChange={handleSeismogramShowEvent}
          onCheckedValueChange={handleSeismogramCheckValueChange}
          onComponentChange={handleSeismogramComponentChange}
          onSpectrogramChange={handleSeismogramSpectrogramChange}
        />
      )}
    </>
  );
};

export default PickerToolbar;
