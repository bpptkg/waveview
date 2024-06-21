import { Dialog, DialogContent, DialogSurface, DialogTitle, SearchBox } from '@fluentui/react-components';

const StreamSelector = () => {
  return (
    <Dialog>
      <DialogSurface>
        <DialogTitle>
          <SearchBox placeholder="Search Channel ID" />
        </DialogTitle>
        <DialogContent>
          <div className="w-full">
            {[
              'VG.MELAB.00.HHZ',
              'VG.MELAB.00.HHN',
              'VG.MELAB.00.HNE',
              'VG.MEKAL.00.HHZ',
              'VG.MEKAL.00.HHN',
              'VG.MEKAL.00.HNE',
              'VG.MEPAS.00.HHZ',
              'VG.MEPAS.00.HHN',
              'VG.MEPAS.00.HNE',
            ].map((channelId) => (
              <button className="w-full h-[32px]" key={channelId} onClick={() => console.log(channelId)}>
                {channelId}
              </button>
            ))}
          </div>
        </DialogContent>
      </DialogSurface>
    </Dialog>
  );
};

export default StreamSelector;
