import { Avatar } from '@fluentui/react-components';
import { useUserStore } from '../../stores/user';

const Account = () => {
  const { user } = useUserStore();
  return <Avatar color="colorful" name={user?.name ?? user?.username} />;
};

export default Account;
