import { Navigate } from 'react-router-dom';
import { useOrganizationStore } from '../../stores/organization';
import { useVolcanoStore } from '../../stores/volcano/useVolcanoStore';

const VolcanoRedirect = () => {
  const { currentOrganization } = useOrganizationStore();
  const { currentVolcano } = useVolcanoStore();
  return <Navigate to={`/${currentOrganization?.slug}/${currentVolcano?.slug}/picker`} />;
};

export default VolcanoRedirect;
