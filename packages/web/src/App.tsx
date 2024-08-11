import { Button, FluentProvider, Spinner, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { CursorHover24Regular, Folder24Regular, PeopleTeam24Regular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, AppBarTab } from './components/AppBar';
import Header from './components/Header/Header';
import { useAppStore } from './stores/app';
import { useCatalogStore } from './stores/catalog';
import { useEventTypeStore } from './stores/eventType';
import { useInventoryStore } from './stores/inventory';
import { useOrganizationStore } from './stores/organization';
import { usePickerStore } from './stores/picker';
import { useUserStore } from './stores/user';
import { useVolcanoStore } from './stores/volcano/useVolcanoStore';

const PickerIcon = CursorHover24Regular;
const CatalogIcon = Folder24Regular;
const AdminIcon = PeopleTeam24Regular;

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { darkMode, theme, toggleTheme } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    toggleTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fetchAllOrganizations } = useOrganizationStore();
  const { fetchInventory } = useInventoryStore();
  const { fetchUser } = useUserStore();
  const { setHelicorderChannelId, setSelectedChannels } = usePickerStore();
  const { fetchEventTypes } = useEventTypeStore();
  const { fetchAllVolcanoes } = useVolcanoStore();
  const { fetchAllCatalogs } = useCatalogStore();

  useEffect(() => {
    const initializeApp = async () => {
      await fetchUser();
      await fetchAllOrganizations();
      await fetchInventory();
      await fetchEventTypes();
      await fetchAllVolcanoes();
      await fetchAllCatalogs();

      setIsInitialized(true);

      const currentOrganizationSettings = useOrganizationStore.getState().currentOrganizationSettings!;
      const { default_helicorder_channel_id, default_seismogram_station_ids, default_seismogram_component } = currentOrganizationSettings.data;

      const helicorderChannelId = default_helicorder_channel_id ?? '';
      setHelicorderChannelId(helicorderChannelId);

      const availableChannels = useInventoryStore.getState().channels();
      const seismogramStationIds = default_seismogram_station_ids ?? [];
      const seismogramComponent = default_seismogram_component ?? 'Z';

      const filteredChannels = availableChannels
        .filter((channel) => seismogramStationIds.includes(channel.station_id))
        .filter((channel) => channel.code.includes(seismogramComponent));

      setSelectedChannels(filteredChannels);
    };

    initializeApp().catch((error: Error) => {
      setError(`Failed to initialize app. ${error.message}`);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col min-h-screen justify-center items-center gap-2">
          <div className="text-red-600 dark:text-red-400">{error}</div>
          <Button appearance="transparent" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </FluentProvider>
    );
  }

  if (!isInitialized) {
    return (
      <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col min-h-screen justify-center items-center">
          <Spinner label="Initializing app, please wait..." />
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
      <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col min-h-screen">
        <Header />

        <div className="flex flex-grow">
          <AppBar selectedValue={location.pathname}>
            <AppBarTab
              value="/picker"
              icon={PickerIcon}
              onClick={() => {
                navigate('/picker');
              }}
            >
              Picker
            </AppBarTab>
            <AppBarTab value="/catalog" icon={CatalogIcon} onClick={() => navigate('/catalog')}>
              Catalog
            </AppBarTab>
            <AppBarTab value="/admin" icon={AdminIcon} onClick={() => navigate('/admin')}>
              Admin
            </AppBarTab>
          </AppBar>

          <div className="bg-neutral-grey-98 dark:bg-neutral-grey-12 flex flex-col flex-grow relative">
            <Outlet />
          </div>
        </div>
      </div>
    </FluentProvider>
  );
}

export default App;
