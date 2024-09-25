import React from 'react';

interface KeyValuePairProps {
  label: string;
  value: React.ReactNode;
}

const KeyValuePair: React.FC<KeyValuePairProps> = ({ label, value }) => (
  <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800">
    <div>{label}</div>
    <div>{value}</div>
  </div>
);

export default KeyValuePair;
