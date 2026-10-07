"use client";
import { patchPassword } from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import { passwordStrength } from "check-password-strength";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";

type passwords = {
  password: string;
  confirmPassword: string;
};

type validation = {
  isEightCharacter: boolean;
  isUpperAndLower: boolean;
  isOneNumber: boolean;
  isSpecialSymbol: boolean;
};

const SetPassword = ({ uid }: { uid: string }) => {
  const [showNPassword, setShowNPassword] = useState<boolean>(false);
  const [showCPassword, setShowCPassword] = useState<boolean>(false);
  const [passStrength, setPassStrength] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const [validate, setValidate] = useState<validation>({
    isEightCharacter: false,
    isUpperAndLower: false,
    isOneNumber: false,
    isSpecialSymbol: false,
  });
  const token = useSearchParams().get("token");
  const [passwords, setPasswords] = useState<passwords>({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  //onsubmit password save
  const handleSetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //if password is not strong enough
    if (passStrength !== "Strong") {
      setErrorText("Password Isn't Strong Enough.");
      return console.log("Password Isn't Strong Enough.");
    }
    //if password doesn't match
    if (passwords.password !== passwords.confirmPassword) {
      setErrorText("Password doesn't match");
      return console.log("Password doesn't match");
    }

    try {
      setIsLoading(true);
      const data = { password: passwords.password };
      const result = await patchPassword(uid, token, data);

      if (result?.success) {
        toast.success("Password Changed Successfully");
        setTimeout(() => {
          router.replace("/auth/signin");
        }, 500);
      }
    } catch (error) {
      toast.error("Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  //onchange password validation
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

    setErrorText("");

    //password strength

    const Strength = passwordStrength(value);
    setPassStrength(Strength.value);
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-[url(/images/Group_11.png)] bg-cover bg-fixed bg-center bg-no-repeat py-6">
      <div className="mx-auto max-w-xl">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/images/Frame.png"
            alt="logo"
            width="225"
            height="54"
          ></Image>
          <h1 className="mb-9 mt-[74px] text-center text-3xl font-bold text-[#F9FAFB]">
            Set New Password
          </h1>
        </div>

        <form onSubmit={handleSetPassword} className="mt-11">
          <div className="relative">
            <Label>New Password</Label>
            <div className="mb-11 mt-2 flex items-center justify-center gap-2 rounded-lg border px-6 py-4">
              <Image
                src="/images/Lock.png"
                width="24"
                height="24"
                alt="avatar"
              ></Image>
              <Input
                value={passwords.password}
                onChange={(e) => {
                  handlePasswordValidation(e);
                  return setPasswords((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                }}
                type={`${showNPassword ? "text" : "password"}`}
                className="h-full w-full text-white"
                placeholder="Set Password"
              ></Input>
              <div
                onClick={() => setShowNPassword(!showNPassword)}
                className="absolute right-4 top-[50%] text-3xl text-[#EAECF0]"
              >
                {showNPassword ? (
                  <IoIosEye></IoIosEye>
                ) : (
                  <IoIosEyeOff></IoIosEyeOff>
                )}
              </div>
            </div>
          </div>

          <div className={`my-7 space-y-3 font-manrope`}>
            <h3 className={`text-[#50B1FF]`}>Password Requires Following:</h3>
            <div className="flex items-center gap-2">
              {validate.isEightCharacter ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image
                    src="/images/tick.png"
                    width={20}
                    height={20}
                    alt="tick"
                  ></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">8 or more characters</p>
            </div>
            <div className="flex items-center gap-2">
              {validate.isUpperAndLower ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image
                    src="/images/tick.png"
                    width={20}
                    height={20}
                    alt="tick"
                  ></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">
                Minimums of one Uppercase and Lowercase letter
              </p>
            </div>
            <div className="flex items-center gap-2">
              {validate.isOneNumber ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image
                    src="/images/tick.png"
                    width={20}
                    height={20}
                    alt="tick"
                  ></Image>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-[#AEAEAE]"></div>
              )}
              <p className="text-gray-200">One number</p>
            </div>
            <div className="flex items-center gap-2">
              {validate.isSpecialSymbol ? (
                <div className="h-5 w-5 rounded-full bg-green-400">
                  <Image
                    src="/images/tick.png"
                    width={20}
                    height={20}
                    alt="tick"
                  ></Image>
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
                    passStrength === "Too weak"
                      ? "text-red-500"
                      : passStrength === "Weak"
                        ? "text-orange-500"
                        : passStrength === "Medium"
                          ? "text-yellow-400"
                          : "text-green-500"
                  }`}
                >
                  {passStrength}
                </p>
              </div>

              <div className="h-4 w-full overflow-hidden rounded-3xl border bg-[#EEEDEF]">
                <div
                  className={`h-full rounded-3xl transition ${
                    passStrength === "Too weak"
                      ? "w-1/4 bg-red-500"
                      : passStrength === "Weak"
                        ? "w-1/2 bg-orange-500"
                        : passStrength === "Medium"
                          ? "w-3/4 bg-yellow-500"
                          : passStrength === "Strong"
                            ? "w-full bg-green-500"
                            : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Label>Confirm New Password</Label>
            <div className="mb-11 mt-2 flex items-center justify-center gap-2 rounded-lg border px-6 py-4">
              <Image
                src="/images/Lock.png"
                width="24"
                height="24"
                alt="avatar"
              ></Image>
              <Input
                value={passwords.confirmPassword}
                onChange={(e) => {
                  setErrorText("");
                  setPasswords((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }));
                }}
                type={`${showCPassword ? "text" : "password"}`}
                className="h-full w-full text-white"
                placeholder="Confirm Set Password"
              ></Input>
              <div
                onClick={() => setShowCPassword(!showCPassword)}
                className="absolute right-4 top-[50%] text-3xl text-[#EAECF0]"
              >
                {showCPassword ? (
                  <IoIosEye></IoIosEye>
                ) : (
                  <IoIosEyeOff></IoIosEyeOff>
                )}
              </div>
            </div>
          </div>

          {errorText && (
            <p className="text-lg font-medium text-red-500">{errorText}</p>
          )}

          <Button
            isLoading={isLoading}
            type="submit"
            spinnerClassName="border-gray-200 h-6 w-6  border-t-[#6A6EF6]"
            className="mt-6 flex w-full min-w-[144px] items-center justify-center bg-white py-3 font-semibold text-[#00035F]"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>

        <Button
          type="button"
          className="mt-6 w-full border border-gray-200 py-3 font-semibold text-gray-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SetPassword;
