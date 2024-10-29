import React from 'react';

export interface AppLauncherItemProps {
  href: string;
  src: string;
  title: string;
}

const AppLauncherItem: React.FC<AppLauncherItemProps> = ({ href, src, title }) => {
  return (
    <li className="w-[86px] h-[86px] pt-1 relative rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300 group cursor-pointer">
      <a href={href} className="w-[86px]">
        <div className="mb-1 flex items-center justify-center">
          <img src={src} alt={title} className="w-[40px] h-[40px] rounded-md"></img>
        </div>
        <span className="inline-block text-sm text-ellipsis text-nowrap overflow-hidden text-center w-[86px] group-hover:text-wrap">{title}</span>
      </a>
    </li>
  );
};

export default AppLauncherItem;
