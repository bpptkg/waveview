import { Button, Spinner } from '@fluentui/react-components';
import { ArrowClockwise20Regular, ChatHelp24Regular, CursorHover24Regular, Folder24Regular, Molecule24Regular } from '@fluentui/react-icons';
import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppBar, AppBarTab } from '../../components/AppBar';
import Header from '../../components/Header/Header';
import LogoImage from '../../components/Header/LogoImage';
import WebSocketProvider from '../../components/WebSocket/WebSocketProvider';
import { useMount } from '../../hooks/useMount';
import { useAppStore } from '../../stores/app';
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
const StatusIcon = Molecule24Regular;

const Dashboard: React.FC = () => {
  const { org, volcano } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchAllOrganizations } = useOrganizationStore();
  const { fetchInventory } = useInventoryStore();
  const { fetchUser } = useUserStore();
  const { fetchPickerConfig } = usePickerStore();
  const { fetchEventTypes } = useEventTypeStore();
  const { fetchAllVolcanoes } = useVolcanoStore();
  const { fetchAllCatalogs } = useCatalogStore();
  const { fetchAllFallDirections } = useFallDirectionStore();

  const { isActivityBarVisible } = useAppStore();

  useMount(() => {
    const initializeApp = async () => {
      await fetchAllOrganizations(org);
      await fetchAllVolcanoes(volcano);
      await fetchInventory();
      await fetchUser();
      await fetchAllCatalogs();
      await fetchEventTypes();
      await fetchPickerConfig();
      await fetchAllFallDirections();

      setIsInitialized(true);
    };

    initializeApp().catch((error: CustomError) => {
      setError(`Failed to initialize app: ${error.message}`);
    });
  });

  const { currentOrganization } = useOrganizationStore();
  const { currentVolcano } = useVolcanoStore();

  const pickerUrl = useMemo(() => {
    return `/${currentOrganization?.slug}/${currentVolcano?.slug}/picker`;
  }, [currentOrganization, currentVolcano]);

  const catalogUrl = useMemo(() => {
    return `/${currentOrganization?.slug}/${currentVolcano?.slug}/catalog`;
  }, [currentOrganization, currentVolcano]);

  const statusUrl = useMemo(() => {
    return `/${currentOrganization?.slug}/status`;
  }, [currentOrganization]);

  const helpUrl = useMemo(() => {
    return `/${currentOrganization?.slug}/help`;
  }, [currentOrganization]);

  if (error) {
    return (
      <>
        <title>Error - VEPS</title>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col w-screen h-screen justify-center items-center gap-2">
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
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col gap-4 w-screen h-screen justify-center items-center">
          <LogoImage size={64} />
          <Spinner label="Initializing app, please wait..." size="medium" />
        </div>
      </>
    );
  }

  return (
    <>
      <WebSocketProvider>
        <title>{currentOrganization?.name} - VEPS</title>
        <div className="bg-neutral-grey-94 dark:bg-neutral-grey-4 flex flex-col w-screen h-screen">
          <Header />
          <div className="flex flex-grow">
            {isActivityBarVisible && (
              <AppBar selectedValue={location.pathname}>
                <AppBarTab value={pickerUrl} icon={PickerIcon} onClick={() => navigate(pickerUrl)}>
                  Picker
                </AppBarTab>
                <AppBarTab value={catalogUrl} icon={CatalogIcon} onClick={() => navigate(catalogUrl)}>
                  Catalog
                </AppBarTab>
                <AppBarTab value={statusUrl} icon={StatusIcon} onClick={() => navigate(statusUrl)}>
                  Status
                </AppBarTab>
                <AppBarTab value={helpUrl} icon={HelpIcon} onClick={() => navigate(helpUrl)}>
                  Help
                </AppBarTab>
              </AppBar>
            )}
            <div className="bg-neutral-grey-98 dark:bg-neutral-grey-12 flex flex-col flex-grow relative rounded-t-lg border border-neutral-grey-90 dark:border-neutral-grey-20">
              <Outlet />
            </div>
          </div>
        </div>
      </WebSocketProvider>
    </>
  );
};

export default Dashboard;
