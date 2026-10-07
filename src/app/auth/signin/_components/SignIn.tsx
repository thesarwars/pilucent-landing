"use client";
import { useAppDispatch } from "@/app/redux/store";
import { setUser } from "@/app/redux/UserData/UserData";
import Button from "@/components/ui/RawButton";
/* eslint-disable react/no-unescaped-entities */
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import Loader from "@/components/ui/Loader";
import { SetCookies } from "@/lib/cookies/Cookies";
import { signInUser } from "@/services/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCompany, getUserProfile } from "@/app/helpers/backend";
import { setLoading } from "@/app/redux/DataState/LoadingState";
type user = {
  email: string;
  password: string;
};

const SignIn = () => {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const path = searchParams.get("redirect");
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userData, setUserData] = useState<user>({
    email: "",
    password: "",
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    // const access = localStorage.getItem("access_token");
    // if (access) {
    //   if (companyId) {
    //     router.push("/dashboard");
    //   } else {
    //     router.push("/company/get_started");
    //   }
    // }
    // setIsLoading(false);
    window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Attempt to sign in the user
      const result = await signInUser({
        email: userData.email,
        password: userData.password,
      });

      if (!result.success && result.message) {
        // Parse and display error messages
        const parsedMessage = JSON.parse(result.message);
        if (parsedMessage.detail) {
          toast.error(parsedMessage.detail);
        } else {
          Object.keys(parsedMessage).forEach((key) => {
            const errorMessages = parsedMessage[key];
            errorMessages.forEach((message: string) => {
              toast.error(message);
            });
          });
        }
      } else {
        // Sign-in was successful
        toast.success("Sign-in successful!");

        // Store the UNSCOPED token from login, then send the user to the
        // workspace picker — they select a company there, which swaps the
        // token for a scoped one before entering the dashboard.
        await SetCookies(result.access);
        localStorage.setItem("access_token", result?.access);
        if (result?.refresh) localStorage.setItem("refresh_token", result.refresh);
        const userData = await getUserProfile();
        dispatch(setUser(userData));
        dispatch(setLoading(false));
        if (userData?.is_superuser) router.replace("/admin");
        else router.replace("/workspace");
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Sign-in Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleSingIn = async () => {
    // const result = await GetRequest("auth/google/callback/");
    // alert("shaharia");
  };
  return (
    <div className="h-screen w-full overflow-y-auto bg-[url(/images/Group_11.png)] bg-cover bg-fixed bg-center bg-no-repeat py-8 font-lexend">
      {isLoading && <Loader />}
      <div className="mx-auto max-w-[580px]">
        <div className="flex flex-col items-center justify-center">
          <Image
            className=""
            src="/images/Frame.png"
            alt="logo"
            width="225"
            height="54"
          ></Image>
          <h1 className="mb-3 mt-16 text-center text-4xl font-bold text-accent_gray_25">
            Welcome!
          </h1>
          <p className="max-w-md text-center text-accent_gray_400">
            We're excited to help you streamline your payroll and financial
            management. Let's get started!
          </p>
        </div>
        <form onSubmit={handleSignIn} className="mt-11 max-w-xl space-y-8">
          <div>
            <Label className="text-accent_gray_200">Email Address</Label>
            <div className="mb-11 mt-2 flex items-center justify-center gap-2 rounded-lg border pl-4">
              <Image
                src="/images/Message.png"
                width="24"
                height="24"
                alt="avatar"
              ></Image>
              <Input
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-full w-full border-accent_gray_200 py-4 pr-6 text-white placeholder:text-accent_gray_200"
                placeholder="Enter Your Email Address"
                required={true}
              ></Input>
            </div>
          </div>

          <div>
            <Label className="text-accent_gray_200">Password</Label>
            <div className="relative mt-2 flex items-center justify-center gap-2 rounded-lg border pl-4">
              <Image
                src="/images/Lock.png"
                width="24"
                height="24"
                alt="avatar"
              ></Image>
              <Input
                value={userData.password}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, password: e.target.value }))
                }
                type={`${showPassword ? "text" : "password"}`}
                className="h-full w-full border-accent_gray_200 py-4 pr-6 text-white placeholder:text-accent_gray_200"
                placeholder="Enter Your Password"
                required={true}
              ></Input>
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[25%] text-3xl text-accent_gray_200"
              >
                {showPassword ? (
                  <AiOutlineEye className="text-[#717171]"></AiOutlineEye>
                ) : (
                  <AiOutlineEyeInvisible className="text-[#717171]"></AiOutlineEyeInvisible>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <Checkbox
              labelText="Remember Me"
              onChange={(e) => console.log(e.target.checked)}
              className="border-blue-500 text-accent_gray_400"
              checkboxClass="w-5 h-5 rounded-sm"
            />

            <Link
              href="/auth/forgotpassword"
              className="text-accent_text_light_red hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div>
            <Button
              className="w-full rounded-lg border bg-white px-6 py-4 font-semibold text-accent_dark_blue"
              type="submit"
              isLoading={false}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>

        <p className="my-6 text-center text-lg font-bold text-white">Or</p>

        <Button
          // onClick={handleSignInWithGoogle}
          type="button"
          className="flex w-full items-center justify-center gap-6 rounded-lg border px-6 py-3 font-semibold text-accent_gray_200"
          onClick={GoogleSingIn}
        >
          <FcGoogle size={32} /> Sign in with Google
        </Button>

        <div>
          <p className="mt-6 text-center text-accent_gray_100">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-accent_light_blue hover:underline"
            >
              Create Account
            </Link>
          </p>
          <p className="mt-2 text-center text-accent_gray_100">
            Do you wish to register your business with ABC?{" "}
            <span className="font-semibold text-accent_light_blue">
              Click Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
