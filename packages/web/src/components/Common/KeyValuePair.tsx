import React from 'react';

interface KeyValuePairProps {
  label: string;
  value: React.ReactNode;
  column?: boolean;
}

const KeyValuePair: React.FC<KeyValuePairProps> = ({ label, value, column }) =>
  column ? (
    <div className="flex flex-col gap-2">
      <div>{label}</div>
      <div>{value}</div>
    </div>
  ) : (
    <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800">
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );

export default KeyValuePair;
