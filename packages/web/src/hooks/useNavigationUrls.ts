import { useMemo } from 'react';
import { useOrganizationStore } from '../stores/organization';
import { useVolcanoStore } from '../stores/volcano/useVolcanoStore';

export const useNavigationUrls = () => {
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

  return { pickerUrl, catalogUrl, statusUrl, helpUrl };
};
