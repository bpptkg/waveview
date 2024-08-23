import { Avatar, Button, Field, Input, Label, Textarea, Toast, Toaster, ToastTitle, Tooltip, useId, useToastController } from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import { format } from 'date-fns';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { useUserStore } from '../../stores/user';
import { CustomError } from '../../types/response';
import { UserDetail } from '../../types/user';

const uploadAvatar = async (file: File): Promise<UserDetail> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api(apiVersion.updateAccount.v1, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    throw CustomError.fromErrorData(await response.json());
  }
  return await response.json();
};

const Profile = () => {
  const { user, fetchUser, setUser } = useUserStore();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name ?? '');
  const [bio, setBio] = useState<string>(user?.bio ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone_number ?? '');

  const inputRef = useRef<HTMLInputElement>(null);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const toasterId = useId('profile');
  const { dispatchToast } = useToastController(toasterId);

  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

  const handleEdit = () => {
    setIsEditing(true);
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
    setEmail(user?.email ?? '');
    setPhoneNumber(user?.phone_number ?? '');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = useCallback(async () => {
    setIsEditing(false);
    setLoading(true);

    try {
      const response = await api(apiVersion.getAccount.v1, {
        method: 'PUT',
        body: {
          name,
          bio,
          email,
          phone_number: phoneNumber,
        },
      });
      if (!response.ok) {
        throw CustomError.fromErrorData(await response.json());
      }
      const user: UserDetail = await response.json();
      setUser(user);
      dispatchToast(
        <Toast>
          <ToastTitle>Profile successfully updated.</ToastTitle>
        </Toast>,
        { intent: 'success' }
      );
      setIsEditing(false);
    } catch (error) {
      showErrorToast(error as CustomError);
    } finally {
      setLoading(false);
    }
  }, [name, bio, email, phoneNumber, showErrorToast, setUser, dispatchToast]);

  const validatePhoneNumber = (value: string) => {
    const phoneNumber = parsePhoneNumberFromString(value);
    if (phoneNumber && phoneNumber.isValid()) {
      setPhoneError('');
      return true;
    } else {
      setPhoneError('Invalid phone number');
      return false;
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    validatePhoneNumber(value);
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      setEmailError('');
      return true;
    } else {
      setEmailError('Invalid email');
      return false;
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const areFieldsValid = useMemo(() => {
    return validatePhoneNumber(phoneNumber) && validateEmail(email);
  }, [phoneNumber, email]);

  const handleAvatarChange = () => {
    inputRef.current?.value && (inputRef.current.value = '');
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadAvatar(files[0])
        .then((user) => {
          setUser(user);
          dispatchToast(
            <Toast>
              <ToastTitle>Avatar successfully updated.</ToastTitle>
            </Toast>,
            { intent: 'success' }
          );
        })
        .catch((error) => {
          showErrorToast(error as CustomError);
        });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-auto">
        <div className="flex flex-col items-center mt-2 mb-4">
          <div className="w-[400px] p-3 rounded-2xl bg-white dark:bg-black">
            {isEditing ? (
              <>
                <Label weight="semibold">Edit Profile</Label>
                <Field label={'Name'}>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label={'Email'}>
                  <Input value={email} onChange={(e) => handleEmailChange(e.target.value)} />
                  <div>
                    <p className="text-red-500 text-sm">{emailError}</p>
                  </div>
                </Field>
                <Field label={'Phone number'}>
                  <Input value={phoneNumber} onChange={(e) => handlePhoneNumberChange(e.target.value)} />
                  <div>
                    <p className="text-red-500 text-sm">{phoneError}</p>
                  </div>
                </Field>
                <Field label={'Bio'}>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} resize="vertical" />
                </Field>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button appearance="secondary" onClick={() => handleCancel()}>
                    Cancel
                  </Button>
                  <Button appearance="primary" onClick={() => handleSave()} disabled={loading || !areFieldsValid}>
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end">
                  <Tooltip content={'Edit profile'} relationship="label" showDelay={1500}>
                    <Button appearance="transparent" onClick={() => handleEdit()}>
                      Edit Profile
                    </Button>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-4 relative">
                  <div className="relative">
                    <Avatar size={128} color="colorful" name={user.name ?? user.username} image={{ src: user.avatar }} />
                    <div className="absolute top-0 right-0 rounded-full bg-blue-600">
                      <Tooltip content={'Change avatar'} relationship="label" showDelay={1500}>
                        <Button appearance="transparent" size="medium" icon={<EditRegular color="white" fontSize={16} />} onClick={handleAvatarChange} />
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0">
                    <div className="text-2xl font-semibold">{user.name}</div>
                    <div>@{user.username}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {user.bio && <p className="mb-4">{user.bio}</p>}
                  <div className="flex items-center justify-between">
                    <div>Email</div>
                    <div>{user.email}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Phone number</div>
                    <div>{user.phone_number}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Date joined</div>
                    <div>{format(new Date(user.date_joined), 'MMMM dd, yyyy')}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Only you can see this information.</div>
                </div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
          <Toaster toasterId={toasterId} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
