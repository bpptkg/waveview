import { Navigate } from 'react-router-dom';
import { useOrganizationStore } from '../../stores/organization';

const RootRedirect = () => {
  const { currentOrganization } = useOrganizationStore();
  return <Navigate to={`/${currentOrganization?.slug}`} />;
};

export default RootRedirect;
