import { Button, Spinner } from '@fluentui/react-components';
import { ArrowClockwise20Regular, ChatHelp24Regular, CursorHover24Regular, Folder24Regular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, AppBarTab } from '../../components/AppBar';
import Header from '../../components/Header/Header';
import WebSocketProvider from '../../components/WebSocket/WebSocketProvider';
import { useCatalogStore } from '../../stores/catalog';
import { useEventTypeStore } from '../../stores/eventType';
import { useInventoryStore } from '../../stores/inventory';
import { useOrganizationStore } from '../../stores/organization';
import { usePickerStore } from '../../stores/picker';
import { useUserStore } from '../../stores/user';
import { useFallDirectionStore } from '../../stores/visual';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';
import { CustomError } from '../../types/response';

const PickerIcon = CursorHover24Regular;
const CatalogIcon = Folder24Regular;
const HelpIcon = ChatHelp24Regular;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentOrganization, fetchAllOrganizations } = useOrganizationStore();
  const { inventory, fetchInventory } = useInventoryStore();
  const { user, fetchUser } = useUserStore();
  const { pickerConfig, fetchPickerConfig } = usePickerStore();
  const { eventTypes, fetchEventTypes } = useEventTypeStore();
  const { currentVolcano, fetchAllVolcanoes } = useVolcanoStore();
  const { currentCatalog, fetchAllCatalogs } = useCatalogStore();
  const { allFallDirections, fetchAllFallDirections } = useFallDirectionStore();

  useEffect(() => {
    const initializeApp = async () => {
      if (!user) {
        await fetchUser();
      }
      if (!currentOrganization) {
        await fetchAllOrganizations();
      }
      if (!inventory) {
        await fetchInventory();
      }
      if (!currentVolcano) {
        await fetchAllVolcanoes();
      }
      if (!currentCatalog) {
        await fetchAllCatalogs();
      }
      if (eventTypes.length === 0) {
        await fetchEventTypes();
      }
      if (!pickerConfig) {
        await fetchPickerConfig();
      }
      if (allFallDirections.length === 0) {
        await fetchAllFallDirections();
      }

      setIsInitialized(true);
    };

    initializeApp().catch((error: CustomError) => {
      setError(`Failed to initialize app: ${error.message}`);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <>
        <title>Error &middot; VEPS</title>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col min-h-screen justify-center items-center gap-2">
          <div className="text-red-600 dark:text-red-400">{error}</div>
          <Button appearance="transparent" onClick={() => window.location.reload()} icon={<ArrowClockwise20Regular />}>
            Retry
          </Button>
        </div>
      </>
    );
  }

  if (!isInitialized) {
    return (
      <>
        <title>Initializing...</title>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col min-h-screen justify-center items-center">
          <Spinner label="Initializing app, please wait..." />
        </div>
      </>
    );
  }

  return (
    <>
      <WebSocketProvider>
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
              <AppBarTab value="/help" icon={HelpIcon} onClick={() => navigate('/help')}>
                Help
              </AppBarTab>
            </AppBar>

            <div className="bg-neutral-grey-98 dark:bg-neutral-grey-12 flex flex-col flex-grow relative">
              <Outlet />
            </div>
          </div>
        </div>
      </WebSocketProvider>
    </>
  );
};

export default Dashboard;
