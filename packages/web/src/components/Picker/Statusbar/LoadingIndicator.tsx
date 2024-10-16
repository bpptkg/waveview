import { Spinner } from '@fluentui/react-components';
import React from 'react';
import { usePickerStore } from '../../../stores/picker';

const LoadingIndicator: React.FC = () => {
  const { loading } = usePickerStore();
  if (!loading) return null;
  return <Spinner label={<span className="text-xs dark:text-neutral-grey-84">Loading...</span>} size="extra-tiny" />;
};

export default LoadingIndicator;
