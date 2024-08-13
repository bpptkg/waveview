import { Avatar } from '@fluentui/react-components';
import { useUserStore } from '../../stores/user';

const Account = () => {
  const { user } = useUserStore();
  return (
    <div className="flex items-center justify-center w-[68px]">
      <Avatar color="colorful" name={user?.name ?? user?.username} image={{ src: user?.avatar }} />
    </div>
  );
};

export default Account;
