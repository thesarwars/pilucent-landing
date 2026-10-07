"use client";
import React, { useState } from "react";
import ProfileImage from "./ProfileImage";
import Button from "@/components/ui/RawButton";
import Profile from "./Profile";
import Settings from "./Settings";
import { useQuery } from "@tanstack/react-query";
import { GetData } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppDispatch } from "@/app/redux/store";
import { setUser } from "@/app/redux/UserData/UserData";
import MainLoader from "@/components/MainLoader/MainLoader";

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const [isProfile, setIsProfile] = useState(true);
  const token = GetToken();
  const { data, isPending, refetch } = useQuery({
    queryKey: ["user_profile_data"],
    queryFn: async () => {
      const response = await GetData(`me`, token);
      dispatch(setUser(response));
      return response;
    },
  });

  if (isPending) {
    return <MainLoader color="#9ca3af" />;
  }

  return (
    <>
      {/* <ToastContainer/> */}
      <ProfileImage User={{ data, isPending, refetch }} />
      <div className="mt-4 flex gap-8 border-b border-accent_bg_light_gray_2xl text-xl font-semibold text-accent_soft_black">
        <Button
          type="button"
          onClick={() => setIsProfile(true)}
          className={`${isProfile ? "active text-accent_soft_blue" : ""} p-1`}
        >
          Profile
        </Button>
        <Button
          type="button"
          onClick={() => setIsProfile(false)}
          className={`${!isProfile ? "active text-accent_soft_blue" : ""} p-1`}
        >
          Settings
        </Button>
      </div>
      <div>
        <div className={`${isProfile ? "" : "hidden"}`}>
          <Profile User={{ data, isPending, refetch }} />
        </div>
        <div className={isProfile ? "hidden" : ""}>
          <Settings User={{ data, isPending, refetch }} />
        </div>
      </div>
    </>
  );
};

export default UserProfile;
