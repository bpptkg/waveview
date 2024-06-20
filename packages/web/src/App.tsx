import { ChatHelp24Regular, CursorHover24Regular, Folder24Regular, PeopleTeam24Regular } from '@fluentui/react-icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, AppBarTab } from './components/AppBar';
import Header from './components/Header';

const PickerIcon = CursorHover24Regular;
const CatalogIcon = Folder24Regular;
const AdminIcon = PeopleTeam24Regular;
const HelpIcon = ChatHelp24Regular;

function App() {
  const navigate = useNavigate();
  return (
    <div className="bg-neutral-grey-94 flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-grow">
        <AppBar>
          <AppBarTab
            value={0}
            icon={PickerIcon}
            onClick={() => {
              navigate('/picker');
            }}
          >
            Picker
          </AppBarTab>
          <AppBarTab value={1} icon={CatalogIcon} onClick={() => navigate('/catalog')}>
            Catalog
          </AppBarTab>
          <AppBarTab value={2} icon={AdminIcon} onClick={() => navigate('/admin')}>
            Admin
          </AppBarTab>
          <AppBarTab value={3} icon={HelpIcon} onClick={() => navigate('/help')}>
            Help
          </AppBarTab>
        </AppBar>

        <div className="bg-neutral-grey-98 flex flex-col flex-grow relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
