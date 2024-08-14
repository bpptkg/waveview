import { Button, FluentProvider, Spinner, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { ArrowClockwise20Regular, ChatHelp24Regular, CursorHover24Regular, Folder24Regular, PeopleTeam24Regular } from '@fluentui/react-icons';
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
import { CustomError } from './types/response';

const PickerIcon = CursorHover24Regular;
const CatalogIcon = Folder24Regular;
const AdminIcon = PeopleTeam24Regular;
const HelpIcon = ChatHelp24Regular;

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { darkMode, theme, toggleTheme } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    toggleTheme(theme);
  }, [toggleTheme, theme]);

  const { currentOrganization, fetchAllOrganizations } = useOrganizationStore();
  const { fetchInventory } = useInventoryStore();
  const { fetchUser } = useUserStore();
  const { setHelicorderChannelId, setSelectedChannels, fetchPickerConfig } = usePickerStore();
  const { fetchEventTypes } = useEventTypeStore();
  const { fetchAllVolcanoes } = useVolcanoStore();
  const { fetchAllCatalogs } = useCatalogStore();

  useEffect(() => {
    const initializeApp = async () => {
      await fetchUser();
      await fetchAllOrganizations();
      await fetchInventory();
      await fetchPickerConfig();
      await fetchEventTypes();
      await fetchAllVolcanoes();
      await fetchAllCatalogs();

      setIsInitialized(true);

      const { pickerConfig } = usePickerStore.getState();
      if (!pickerConfig) {
        throw new CustomError('Picker configuration is not available');
      }

      setHelicorderChannelId(pickerConfig.helicorder_config.channel.id);
      const seismogramComponent = pickerConfig.seismogram_config.component;
      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels = pickerConfig.seismogram_config.station_configs.map((stationConfig) => {
        const channel = availableChannels.find((channel) => channel.station_id === stationConfig.station.id && channel.code.includes(seismogramComponent));
        if (!channel) {
          throw new CustomError(`Channel for station ${stationConfig.station.id} not found`);
        }
        return channel;
      });
      setSelectedChannels(selectedChannels);
    };

    initializeApp().catch((error: CustomError) => {
      setError(`Failed to initialize app (${error.message})`);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col min-h-screen justify-center items-center gap-2">
          <div className="text-red-600 dark:text-red-400">{error}</div>
          <Button appearance="transparent" onClick={() => window.location.reload()} icon={<ArrowClockwise20Regular />}>
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
      <title>{currentOrganization?.name}</title>

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
            <AppBarTab value="/help" icon={HelpIcon} onClick={() => navigate('/help')}>
              Help
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
