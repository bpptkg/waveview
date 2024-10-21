import { Avatar, AvatarSize, Tooltip } from '@fluentui/react-components';
import { baseUrl } from '../../services/api';
import { User } from '../../types/user';

const Author: React.FC<{ author?: User; size?: AvatarSize }> = ({ author, size = 32 }) => {
  if (!author) {
    return null;
  }

  const avatarUrl = author.avatar && !author.avatar.startsWith('http') ? `${baseUrl}${author.avatar}` : author.avatar;

  return (
    <Tooltip content={author.name || author.username} relationship="label">
      <Avatar size={size} aria-label={author.name} name={author.name} color="colorful" image={{ src: avatarUrl }} />
    </Tooltip>
  );
};

export default Author;
