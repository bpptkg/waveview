import { Navigate } from 'react-router-dom';
import { useOrganizationStore } from '../../stores/organization';

const OrganizationRedirect = () => {
  const { currentOrganization } = useOrganizationStore();
  return <Navigate to={`/${currentOrganization?.slug}/:volcano`} />;
};

export default OrganizationRedirect;
