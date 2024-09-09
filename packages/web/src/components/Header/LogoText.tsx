import React from 'react';

export interface LogoTextProps {
  className?: string;
}

const LogoText: React.FC<LogoTextProps> = (props) => {
  const { className = 'font-bold text-gray-800 dark:text-neutral-grey-84' } = props;
  return <span className={className}>VEPS</span>;
};

export default LogoText;
