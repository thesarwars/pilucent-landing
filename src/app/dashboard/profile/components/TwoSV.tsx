import Button from '@/components/ui/RawButton';
import { useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import Switch from './Switch';
import { useMutation } from '@tanstack/react-query';
import { Patch } from '@/services/FetchMethods';
import { toast } from '@/lib/ToastService';
import {
  confirmAuthenticationAppOTP,
  fetchAddAuthenticationApp,
  postDisable2fa,
} from '@/app/helpers/backend';
import QRCode from 'react-qr-code';

type SetupStep = 'qr' | 'manual' | 'verify';

const formatSecretKey = (key: string) => {
  return key.replace(/(.{4})/g, '$1 ').trim();
};

const TwoSV = ({ User }: { User: any }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [Pending, setIsPending] = useState(false);
  const [showSetupQRCode, setShowSetupQRCode] = useState(false);
  const [qrCodeInfo, setQrCodeInfo] = useState<any>({});
  const [isPhoneEnabled, setIsPhoneEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('qr');
  const [verificationCode, setVerificationCode] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const { data: UserData, isPending, refetch } = User;

  useEffect(() => {
    if (UserData) {
      setIsEmailEnabled(UserData.is_email_verification_enabled);
      setIsPhoneEnabled(UserData.is_sms_verification_enabled);
      setIs2faEnabled(UserData.is_2fa_enabled);
    }
  }, [UserData, isEdit]);

  const {
    mutate: Update,
    isPending: isUpdating,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data: any) => Patch(`me`, data, ''),
    onSuccess: (res) => {
      toast.success('Two step verification updated.');
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
    const data = {
      is_email_verification_enabled: isEmailEnabled,
      is_sms_verification_enabled: isPhoneEnabled,
    };
    Update(data);
  };

  const handleAddAuthenticationApp = async () => {
    try {
      setIsPending(true);
      const res = await fetchAddAuthenticationApp();
      if (res) {
        setQrCodeInfo(res);
        setSetupStep('qr');
        setVerificationCode('');
        setShowSetupQRCode(true);
      }
    } catch (error) {
      // toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  const handleCloseSetup = async () => {
    setShowSetupQRCode(false);
    setSetupStep('qr');
    setVerificationCode('');
  };

  const handleVerifyAuthenticationApp = async () => {
    try {
      setIsPending(true);
      const res = await confirmAuthenticationAppOTP({
        token: verificationCode,
      });
      if (res?.success) {
        setIs2faEnabled(true);
        refetch();
        toast.success('Authentication app confirmed successfully');
        handleCloseSetup();
      }
    } catch (error) {
      // toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveAuthenticationApp = async () => {
    try {
      setIsPending(true);
      const res = await postDisable2fa({ token: verificationCode });
      if (res?.success) {
        setIs2faEnabled(false);
        toast.success('Authentication app removed successfully');
        setShowRemoveModal(false);
        refetch();
      }
    } catch (error) {
      // toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-accent_bg_lavender bg-white p-4 shadow">
      {Pending && (
        <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accent_soft_black"></div>
        </div>
      )}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-[#333752] md:text-lg">Two Step verification</h3>{' '}
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} className="rounded-full p-2 hover:bg-gray-100">
            <FiEdit className="text-lg text-black" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {!isEdit && (
          <div className="flex items-center gap-1">
            <div
              className={`${
                UserData?.is_email_verification_enabled ||
                UserData?.is_sms_verification_enabled ||
                UserData?.is_2fa_enabled
                  ? 'bg-green-500'
                  : 'bg-[#f0f0f0]'
              } relative h-[30px] w-[57px] cursor-pointer rounded-full border border-[#e5eaf2] px-[0.150rem] py-[0.160rem] transition-colors duration-500`}
            >
              <div
                className={`${
                  UserData?.is_email_verification_enabled ||
                  UserData?.is_sms_verification_enabled ||
                  UserData?.is_2fa_enabled
                    ? 'translate-x-[27px]'
                    : 'translate-x-[0px]'
                } h-[23px] w-[23px] rounded-full bg-[#fff] pb-1 transition-all duration-500`}
                style={{ boxShadow: '1px 2px 5px 2px rgb(0,0,0,0.1)' }}
              ></div>
            </div>{' '}
            <p className="text-normal text-[#5A607F]">
              {' '}
              {UserData?.is_email_verification_enabled ||
              UserData?.is_sms_verification_enabled ||
              UserData?.is_2fa_enabled
                ? 'Turned On'
                : 'Turned Off'}
            </p>
          </div>
        )}
      </div>
      {isEdit && (
        <>
          {/* <div className="mb-5 flex flex-col items-center justify-between max-md:items-start md:flex-row md:gap-8">
            <p className="font-medium text-black">
              Text Message <br />{' '}
              <span className="font-light text-accent_soft_black">
                Receive a prompt from your mobile app to confirm it’s you.{' '}
              </span>
            </p>
            <Switch setValue={setIsPhoneEnabled} value={isPhoneEnabled} />
          </div>

          <div className="flex flex-col items-center justify-between max-md:items-start md:flex-row md:gap-8">
            <p className="font-medium text-black">
              Email passcode <br />{' '}
              <span className="font-light text-accent_soft_black">
                Receive a prompt from your email to confirm it’s you.{' '}
              </span>
            </p>
            <Switch setValue={setIsEmailEnabled} value={isEmailEnabled} />
          </div> */}
          <div className="mt-2 flex flex-col items-center justify-between max-md:items-start md:flex-row md:gap-8">
            <p className="font-medium text-black">
              Authentication App <br />{' '}
              <span className="font-light text-accent_soft_black">
                Enable authentication app for two step verification.{' '}
              </span>
            </p>
            <div className="flex flex-col items-end">
              <Switch
                setValue={(value: any) => {
                  if (value) {
                    handleAddAuthenticationApp();
                  } else {
                    setShowRemoveModal(true);
                  }
                }}
                value={is2faEnabled}
              />
              {/* {!UserData?.is_2fa_enabled ? (
                <Button disabled={Pending} onClick={() => handleAddAuthenticationApp()}>
                  {Pending ? 'Adding...' : 'Add'}
                </Button>
              ) : (
                <Button onClick={() => setShowRemoveModal(true)}>Remove</Button>
              )} */}
            </div>
          </div>

          <div className="items mt-4 flex gap-4">
            {/* <Button
              isLoading={isUpdating}
              onClick={handleSave}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button> */}
            <Button
              onClick={() => setIsEdit(false)}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Back
            </Button>
          </div>
        </>
      )}

      {showSetupQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleCloseSetup} />

          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="border-b pb-3 text-lg font-medium text-gray-900">
              Set up authenticator app
            </h2>

            {setupStep === 'qr' && (
              <div className="flex flex-col items-center gap-4 pt-4">
                <ul className="w-full list-disc space-y-1 pl-5 text-sm text-gray-700">
                  <li>
                    In the Authenticator app, tap the <span className="font-bold">+</span>
                  </li>
                  <li>
                    Choose <span className="font-bold">Scan a QR code</span>
                  </li>
                </ul>

                <div className="py-4">
                  <QRCode value={qrCodeInfo.otpauth_url || ''} size={160} />
                </div>

                <button
                  type="button"
                  onClick={() => setSetupStep('manual')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Can&apos;t scan it?
                </button>

                <div className="flex w-full items-center justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseSetup}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep('verify')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {setupStep === 'manual' && (
              <div className="flex flex-col gap-4 pt-4">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-700">
                  <li>
                    In the Google Authenticator app, tap the <span className="font-bold">+</span>{' '}
                    then tap <span className="font-bold">Enter a setup key</span>
                  </li>
                  <li>
                    Enter your email address and this key (spaces don&apos;t matter):
                    <div className="mt-1 text-sm font-semibold tracking-wide text-gray-900">
                      {formatSecretKey(qrCodeInfo.secret_key || '')}
                    </div>
                  </li>
                  <li>
                    Make sure that <span className="font-bold">Time based</span> is selected
                  </li>
                  <li>
                    Tap <span className="font-bold">Add</span> to finish
                  </li>
                </ol>

                <div className="flex w-full items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setSetupStep('qr')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Back
                  </button>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseSetup}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupStep('verify')}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {setupStep === 'verify' && (
              <div className="flex flex-col gap-4 pt-4">
                <p className="text-sm text-gray-700">
                  Enter the 6-digit code that you see in the app
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  placeholder="Enter code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex w-full items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setSetupStep('manual')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Back
                  </button>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleCloseSetup}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={Pending}
                      type="button"
                      onClick={() => {
                        handleVerifyAuthenticationApp();
                        // Verification logic goes here
                      }}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {Pending ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* remove authenticator modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRemoveModal(false)} />

          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="border-b pb-3 text-lg font-medium text-gray-900">
              Remove authenticator app
            </h2>

            <div className="flex flex-col gap-4 pt-4">
              <p className="text-sm text-gray-700">
                Enter the 6-digit code that you see in the app to remove the authenticator app
              </p>

              <input
                type="text"
                inputMode="numeric"
                minLength={6}
                maxLength={6}
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <div className="flex w-full items-center justify-between pt-4">
                <div className="flex w-full items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowRemoveModal(false)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={Pending}
                    type="button"
                    onClick={() => {
                      handleRemoveAuthenticationApp();
                      // Verification logic goes here
                    }}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {Pending ? 'Verifying...' : 'Verify And Remove'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoSV;
