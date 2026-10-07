"use client";
import { use } from "react";
import UpdateBill from "../_components/UpdateBill";

const Page = (
  props: {
      params: Promise<{ uid: string }>
    }
) => {
  const params = use(props.params);
  return ( 
      <>
        <UpdateBill uid={params?.uid}/>  
      </>
  );
};

export default Page;