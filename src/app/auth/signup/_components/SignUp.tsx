/* eslint-disable react/no-unescaped-entities */
'use client';

import Button from '@/components/ui/RawButton';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Input from '@/components/ui/RawInput';
import Label from '@/components/ui/RawLabel';
import Loader from '@/components/ui/Loader';
import { registerUser } from '@/services/auth';
import { passwordStrength } from 'check-password-strength';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './PhoneInput.module.css';

type formData = {
  full_name: string;
  email_address: string;
  phone_number: string;
  password: string;
  confirm_password: string;
};

type validation = {
  isEightCharacter: boolean;
  isUpperAndLower: boolean;
  isOneNumber: boolean;
  isSpecialSymbol: boolean;
};

const SignUp = () => {
  const [showNPassword, setShowNPassword] = useState<boolean>(false);
  const [showCPassword, setShowCPassword] = useState<boolean>(false);
  const [passStrength, setPassStrength] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const router = useRouter();
  const [validate, setValidate] = useState<validation>({
    isEightCharacter: false,
    isUpperAndLower: false,
    isOneNumber: false,
    isSpecialSymbol: false,
  });
  const [userData, setUserData] = useState<formData>({
    full_name: '',
    email_address: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const eightCharacter = /.{8,}/;
    const upperAndLower = /(?=.*[a-z])(?=.*[A-Z])/;
    const number = /(?=.*\d)/;
    const specialChar = /(?=.*[@$!%*?&])/;

    setValidate((prev) => ({
      ...prev,
      isEightCharacter: eightCharacter.test(value),
    }));
    setValidate((prev) => ({
      ...prev,
      isUpperAndLower: upperAndLower.test(value),
    }));
    setValidate((prev) => ({
      ...prev,
      isOneNumber: number.test(value),
    }));
    setValidate((prev) => ({
      ...prev,
      isSpecialSymbol: specialChar.test(value),
    }));

    setErrorText('');

    //password strength

    const Strength = passwordStrength(value);
    setPassStrength(Strength.value);
  };

  useEffect(() => {
    router.push('/dashboard');
  }, []);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData?.phone_number) {
      toast.error('Enter a Valid Phone Number');
    }
    // Password strength check
    if (passStrength !== 'Strong') {
      setErrorText("Password Isn't Strong Enough.");
      return;
    }
    // Password match check
    if (userData.password !== userData.confirm_password) {
      setErrorText("Password doesn't match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: userData.full_name,
        email: userData.email_address,
        phone: userData.phone_number,
        password: userData.password,
      });

      console.log(result);

      if (!result.success && result.message) {
        const errors = JSON.parse(result.message);
        Object.keys(errors).forEach((key) => {
          const errorMessages = errors[key];
          errorMessages.forEach((message: string) => {
            toast.error(message);
          });
        });
      } else {
        // Handle successful registration case if needed
        toast.success('Registration successful!');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 1500);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`;
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto bg-[url(/images/Group_11.png)] bg-cover bg-fixed bg-center bg-no-repeat py-8 font-lexend">
      {isLoading && <Loader />}
      <div className="mx-auto max-w-[580px]">
        <div className="flex flex-col items-center justify-center">
          <Image className="" src="/images/Frame.png" alt="logo" width="225" height="54"></Image>
          <h1 className="mb-3 mt-16 text-center text-4xl font-bold text-accent_gray_25">
            Welcome!
          </h1>
          <p className="text-center text-accent_gray_400">
            We're excited to help you streamline your payroll and financial <br />
            management. Let's get started!
          </p>
        </div>

        <Button
          type="button"
          className="mt-8 flex w-full items-center justify-center gap-6 rounded-lg border bg-[#EFEFEF] px-6 py-3 font-semibold text-accent_dark_blue"
        >
          <FcGoogle size={32} /> Sign in with Google
        </Button>

        <form onSubmit={handleSignUp} className="mt-6 max-w-xl space-y-8">
          <div>
            <Label>Full Name</Label>
            <Input
              value={userData.full_name}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  full_name: e.target.value,
                }))
              }
              type="text"
              className="mt-2 h-full w-full rounded-lg border px-6 py-4 text-white placeholder:text-sm placeholder:text-[#EAECF0]"
              placeholder="Enter Your Full Name"
              required={true}
            ></Input>
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              value={userData.email_address}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  email_address: e.target.value,
                }))
              }
              type="email"
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
              value={userData.phone_number}
              onChange={(value) => {
                setUserData((prev) => ({
                  ...prev,
                  phone_number: `+${value}`,
                }));
              }}
              enableSearch={true}
            />
          </div>

          <div className="relative mb-8">
            <Label>Password</Label>

            <Input
              value={userData.password}
              onChange={(e) => {
                handlePasswordValidation(e);
                return setUserData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }));
              }}
              type={`${showNPassword ? 'text' : 'password'}`}
              className="mt-2 h-full w-full rounded-lg border px-6 py-4 text-white"
              placeholder="Set Password"
              required={true}
            ></Input>
            <div
              onClick={() => setShowNPassword(!showNPassword)}
              className="absolute right-4 top-[50%] text-3xl text-[#EAECF0]"
            >
              {showNPassword ? <IoIosEye></IoIosEye> : <IoIosEyeOff></IoIosEyeOff>}
            </div>
          </div>

          <div className={`font-manrope my-7 space-y-3`}>
            <h3 className={`text-[#50B1FF]`}>Password Requires Following:</h3>
            <div className="flex items-center gap-2">
              {validate.isEightCharacter ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image src="/images/tick.png" width={20} height={20} alt="tick"></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">8 or more characters</p>
            </div>
            <div className="flex items-center gap-2">
              {validate.isUpperAndLower ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image src="/images/tick.png" width={20} height={20} alt="tick"></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">Minimums of one Uppercase and Lowercase letter</p>
            </div>
            <div className="flex items-center gap-2">
              {validate.isOneNumber ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image src="/images/tick.png" width={20} height={20} alt="tick"></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">One number</p>
            </div>
            <div className="flex items-center gap-2">
              {validate.isSpecialSymbol ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image src="/images/tick.png" width={20} height={20} alt="tick"></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">One special symbol</p>
            </div>
            <div>
              <div className="mt-4 flex w-full items-center justify-between">
                <h3 className="mb-3 text-[#50B1FF]">Password Strength</h3>
                <p
                  className={`text-lg font-light capitalize ${
                    passStrength === 'Too weak'
                      ? 'text-red-500'
                      : passStrength === 'Weak'
                        ? 'text-orange-500'
                        : passStrength === 'Medium'
                          ? 'text-yellow-400'
                          : 'text-green-500'
                  }`}
                >
                  {passStrength}
                </p>
              </div>

              <div className="h-4 w-full overflow-hidden rounded-3xl border bg-[#EEEDEF]">
                <div
                  className={`h-full rounded-3xl transition ${
                    passStrength === 'Too weak'
                      ? 'w-1/4 bg-red-500'
                      : passStrength === 'Weak'
                        ? 'w-1/2 bg-orange-500'
                        : passStrength === 'Medium'
                          ? 'w-3/4 bg-yellow-500'
                          : passStrength === 'Strong'
                            ? 'w-full bg-green-500'
                            : ''
                  }`}
                ></div>
              </div>
            </div>
          </div>

          <div className="relative mb-11">
            <Label>Re-Type Password</Label>

            <Input
              value={userData.confirm_password}
              onChange={(e) => {
                setErrorText('');
                setUserData((prev) => ({
                  ...prev,
                  confirm_password: e.target.value,
                }));
              }}
              type={`${showCPassword ? 'text' : 'password'}`}
              className="mt-2 h-full w-full rounded-lg border px-6 py-4 text-white placeholder:text-sm"
              placeholder="Confirm Password"
              required={true}
            ></Input>
            <div
              onClick={() => setShowCPassword(!showCPassword)}
              className="absolute right-4 top-[50%] text-3xl text-[#EAECF0]"
            >
              {showCPassword ? <IoIosEye></IoIosEye> : <IoIosEyeOff></IoIosEyeOff>}
            </div>
          </div>

          {errorText && <p className="text-lg font-medium text-red-500">{errorText}</p>}

          <div>
            <label className="flex cursor-pointer items-start gap-2 text-[#EAECF0]">
              <Checkbox className="mt-1 rounded-none" checkboxClass="rounded-sm w-5 h-5" />
              <p>
                By creating an account, you agreeing to our{' '}
                <span className="text-[#50B1FF] hover:underline">Privacy Policy</span>, and{' '}
                <span className="text-[#50B1FF] hover:underline">Terms and Condition</span>
              </p>
            </label>
          </div>
          <div>
            <Button
              className="w-full bg-white font-semibold text-accent_dark_blue"
              type="submit"
              isLoading={false}
            >
              Sign Up
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-[#F2F4F7]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-semibold text-[#50B1FF] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
