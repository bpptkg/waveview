import { Avatar } from '@fluentui/react-components';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useUserStore } from '../../stores/user';

const Profile = () => {
  const { user, fetchUser, isAdmin } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-[400px] p-3 rounded-2xl bg-white dark:bg-black">
        {isAdmin() && (
          <div className="flex justify-end">
            <div className="text-sm bg-blue-500 text-white px-2 rounded-full">Admin</div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <Avatar size={128} color="colorful" name={user.name ?? user.username} image={{ src: user.avatar }} />
          <div className="flex flex-col gap-0">
            <div className="text-2xl font-semibold">{user.name}</div>
            <div>@{user.username}</div>
          </div>
        </div>

        <div className="mt-4">
          {user.bio && <p className="mb-4">{user.bio}</p>}
          <div>
            <div className="flex items-center justify-between">
              <div>Email</div>
              <div>{user.email}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Date joined</div>
              <div>{format(new Date(user.date_joined), 'MMMM dd, yyyy')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
