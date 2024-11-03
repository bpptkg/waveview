import { Avatar, AvatarSize, Tooltip } from '@fluentui/react-components';
import { media } from '../../shared/media';
import { User } from '../../types/user';

const Author: React.FC<{ author?: User; size?: AvatarSize }> = ({ author, size = 32 }) => {
  if (!author) {
    return null;
  }

  return (
    <Tooltip content={author.name || author.username} relationship="label">
      <Avatar size={size} aria-label={author.name} name={author.name} color="colorful" image={{ src: media(author?.avatar) }} />
    </Tooltip>
  );
};

export default Author;
