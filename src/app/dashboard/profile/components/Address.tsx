import Button from '@/components/ui/RawButton';
import Label from '@/components/ui/RawLabel';
import GetToken from '@/hooks/getToken';
import { countryList } from '@/lib/helpers/Customer';
import { toast } from '@/lib/ToastService';
import { Patch } from '@/services/FetchMethods';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';

const Address = ({ User }: { User: any }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState({
    phone: '',
    country: '',
    address: '',
  });

  const { data: UserData, isPending, refetch } = User;

  useEffect(() => {
    const fn = () => {
      if (UserData) {
        setData({
          phone: UserData?.phone,
          country: UserData?.country,
          address: UserData?.address,
        });
      }
    };
    fn();
  }, [UserData]);

  const {
    mutate: Update,
    isPending: isUpdating,
    isError,
    error,
  } = useMutation({
    mutationKey: ['update_profile_image'],
    mutationFn: async (data: any) => Patch(`me`, data, ''),
    onSuccess: (res) => {
      toast.success('Contact info updated.');
      setIsEdit(false);
      refetch();
    },
    onError: (res) => {
      // toast.error("An Unknown Error Occurred!");
    },
  });

  useEffect(() => {
    if (isError) {
      try {
        const errors = JSON.parse(error.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(`${key.split('_').join(' ').toUpperCase()} :- ${message}`);
          });
        });
      } catch (err) {
        toast.error('Something Went Wrong');
      }
    }
  }, [error, isError]);

  const handleSave = () => {
    Update(data);
  };

  return (
    <div className="mt-4 rounded-lg border border-accent_bg_lavender bg-white p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#333752] md:text-lg">
          Address & Contact Information
        </h3>{' '}
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} className="p-1">
            <FiEdit className="text-xl text-[#5A607F]" />
          </Button>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex flex-col items-center justify-start max-md:items-start md:flex-row md:gap-8">
          <Label className="w-20 font-normal text-[#5A607F]">Phone</Label>
          <input
            value={data.phone}
            onChange={(e) => setData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder=""
            className={`h-10 self-start rounded-lg py-3 font-normal outline-none md:px-6 ${isEdit ? 'border border-[#A1A7C4]' : ''}`}
            type="text"
            required
            readOnly={!isEdit}
          />
        </div>
        <div className="flex flex-col items-center justify-start max-md:items-start md:flex-row md:gap-8">
          <Label className="w-20 font-normal text-[#5A607F]">Email</Label>
          <input
            value={UserData?.email}
            placeholder=""
            className={`h-10 self-start rounded-lg py-3 font-normal outline-none md:px-6`}
            type="text"
            required
            readOnly
          />
          {isEdit && <p>Email Address can not be changed.</p>}
        </div>
        <div className="flex flex-col items-center justify-start max-md:items-start md:flex-row md:gap-8">
          <Label className="w-20 font-normal text-[#5A607F]">Country</Label>
          {!isEdit ? (
            <p className="uppercase md:px-6">{UserData?.country}</p>
          ) : (
            <select
              value={data.country}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  country: e.target.value,
                }))
              }
              defaultValue=""
              className="h-10 w-[265px] self-start rounded-lg border border-[#A1A7C4] bg-transparent outline-none md:px-6"
              required
              aria-readonly
            >
              {countryList.map((country) => (
                <option key={country.tld} value={country.tld}>
                  {country.country}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col items-center justify-start max-md:items-start md:flex-row md:gap-8">
          <Label className="w-20 font-normal text-[#5A607F]">Address</Label>
          <input
            value={data.address}
            onChange={(e) => setData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder=""
            className={`h-10 self-start rounded-lg py-3 font-normal outline-none md:px-6 ${isEdit ? 'border border-[#A1A7C4]' : ''}`}
            type="text"
            required
            readOnly={!isEdit}
          />
        </div>
      </div>
      {isEdit && (
        <div className="mt-4 flex items-center gap-4">
          <Button
            isLoading={isUpdating}
            onClick={handleSave}
            className="flex min-w-36 items-center justify-center rounded-lg bg-accent_soft_black py-2.5 text-white"
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={() => setIsEdit(false)}
            className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default Address;
