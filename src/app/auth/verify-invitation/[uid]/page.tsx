'use client';
import { useState, useEffect } from 'react';
import { fetchUserOnboardVerify, patchUserProfile, getUserProfile } from '@/app/helpers/backend';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Label from '@/components/ui/RawLabel';
import Input from '@/components/ui/RawInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../_components/PhoneInput.module.css';
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import Button from '@/components/ui/RawButton';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/redux/store';
import { setUser } from '@/app/redux/UserData/UserData';
import { toast } from '@/lib/ToastService';

const VerifyInvitation = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { uid } = useParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [accessToken, setAccessToken] = useState<any>('');

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        const response = await fetchUserOnboardVerify(uid);

        if (response.success) {
          // Save access token to localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          setAccessToken(response.access_token);

          // Open modal and pre-fill email
          setEmail(response.email);
          setIsModalOpen(true);
        } else {
          toast.error('Unable to verify invitation.');
        }
      } catch (error) {
        toast.error('Something went wrong during verification.');
      }
    };

    if (uid) {
      verifyInvitation();
    }
  }, [uid]);

  const handleProfileUpdate = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    if (!phone || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    // Password match check
    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone: `+${phone}`, // Ensure phone number is in international format
        password,
      };
      const response = await patchUserProfile(payload);

      if (response.success) {
        toast.success('Profile updated successfully.');

        const userData = await getUserProfile();
        dispatch(setUser(userData));
        setIsModalOpen(false);

        if (userData?.is_employee) {
          router.push(
            `/onboarding?emp=${userData?.employee?.uid}&access_token=${localStorage.getItem('access_token')}`
          );
        } else {
          router.push(
            `/auth?access_token=${localStorage.getItem('access_token')}&refresh_token=${localStorage.getItem('refresh_token')}`
          );
        }
      } else {
        toast.error(response.message || 'Unable to update profile.');
      }
    } catch (error) {
      toast.error('Something went wrong during profile update.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[url(/images/Group_11.png)] bg-cover bg-fixed bg-center bg-no-repeat py-8 font-lexend">
      <div className="mx-4 w-full rounded-xl">
        <div className="mx-auto max-w-[580px]">
          <div className="flex flex-col items-center justify-center">
            <Image className="" src="/images/Frame.png" alt="logo" width="225" height="54"></Image>
            <h1 className="mb-3 mt-16 text-center text-4xl font-bold text-accent_gray_25">
              Welcome!
            </h1>
            <p className="text-center text-accent_gray_400">
              We are excited to help you streamline your payroll and financial <br />
              management. Lets get started!
            </p>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <Label>Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                className="mt-2 h-full w-full rounded-lg border px-6 py-4 text-white placeholder:text-sm placeholder:text-[#EAECF0]"
                placeholder="Enter Your Full Name"
                required={true}
              ></Input>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={email}
                type="text"
                className="mt-2 h-full w-full rounded-lg border px-6 py-4 text-white placeholder:text-sm placeholder:text-[#EAECF0]"
                placeholder="Enter Your Email Address"
                required={true}
              ></Input>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <PhoneInput
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                }}
                isValid={false}
                inputStyle={{
                  color: 'white',
                  height: '48px',
                  background: 'transparent',
                  borderColor: 'white',
                  width: '100%',
                }}
                country={'us'}
                buttonStyle={{
                  background: 'transparent',
                  borderColor: 'white',
                }}
                value={phone}
                onChange={(value) => setPhone(value)}
                enableSearch={true}
              />
            </div>

            <div className="relative mb-8">
              <Label>Password</Label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={`${showPassword ? 'text' : 'password'}`}
                className="mt-2 h-full w-full rounded-lg border bg-transparent px-6 py-4 text-white outline-none"
                placeholder="Set Password"
                required={true}
                autoComplete="new-password"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[50%] text-3xl text-[#EAECF0]"
              >
                {showPassword ? <IoIosEye /> : <IoIosEyeOff />}
              </div>
            </div>

            <div className="relative mb-8">
              <Label>Re-Type Password</Label>
              <Input
                value={confirmPassword}
                onChange={(e) => {
                  setErrorText('');
                  setConfirmPassword(e.target.value);
                }}
                type={`${showPassword ? 'text' : 'password'}`}
                className="mt-2 h-full w-full rounded-lg border px-6 py-4 text-white"
                placeholder="Confirm Password"
                required={true}
              ></Input>
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[50%] text-3xl text-[#EAECF0]"
              >
                {showPassword ? <IoIosEye /> : <IoIosEyeOff />}
              </div>
            </div>

            {errorText && <p className="text-lg font-medium text-red-500">{errorText}</p>}

            <Button
              className="w-full bg-white font-semibold text-accent_dark_blue"
              type="submit"
              isLoading={isLoading}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyInvitation;
