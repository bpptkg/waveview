import React from 'react';
import { usePickerStore } from '../../../stores/picker';

const LoadingIndicator: React.FC = () => {
  const { loading } = usePickerStore();
  if (!loading) return null;
  return <span className="text-xs dark:text-neutral-grey-84">Loading...</span>;
};

export default LoadingIndicator;
