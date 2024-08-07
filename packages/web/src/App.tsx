import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { ChatHelp24Regular, CursorHover24Regular, Folder24Regular, PeopleTeam24Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, AppBarTab } from './components/AppBar';
import Header from './components/Header/Header';
import { useAppStore } from './stores/app';
import { useInventoryStore } from './stores/inventory';
import { useOrganizationStore } from './stores/org';

const PickerIcon = CursorHover24Regular;
const CatalogIcon = Folder24Regular;
const AdminIcon = PeopleTeam24Regular;
const HelpIcon = ChatHelp24Regular;

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { darkMode, theme, toggleTheme } = useAppStore();

  useEffect(() => {
    toggleTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fetchOrganizations } = useOrganizationStore();
  const { fetchInventory } = useInventoryStore();
  useEffect(() => {
    fetchOrganizations().then(() => {
      fetchInventory();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
