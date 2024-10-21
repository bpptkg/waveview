import { AvatarSize } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { User } from '../../types/user';
import Author from './Author';

export interface CollaboratorsProps {
  collaborators?: User[];
  maxShown?: number;
  enableShowAll?: boolean;
  avatarSize?: AvatarSize;
}

const Collaborators: React.FC<CollaboratorsProps> = ({ collaborators = [], maxShown = 5, enableShowAll = true, avatarSize }) => {
  const [showAll, setShowAll] = useState(false);
  const remainingCount = useMemo(() => collaborators.length - maxShown, [collaborators, maxShown]);

  const authors = useMemo(() => {
    if (showAll || collaborators.length <= maxShown) {
      return collaborators;
    }
    return collaborators.slice(0, maxShown);
  }, [collaborators, maxShown, showAll]);

  const toggleShowAll = () => {
    setShowAll((prevShowAll) => !prevShowAll);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {authors.map((author) => (
        <Author size={avatarSize} key={author.id} author={author} />
      ))}
      {collaborators.length > maxShown && (
        <div className="flex items-center">
          {!showAll && <span className="text-sm">+{remainingCount}</span>}
          {enableShowAll && (
            <button onClick={toggleShowAll} className="text-blue-600 ml-2">
              {showAll ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Collaborators;
