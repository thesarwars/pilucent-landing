import SetPassword from "@/app/auth/password/_components/SetPassword";

const page = async (props: { params: Promise<{ uid: string }> }) => {
  const params = await props.params;
  return (
    <>
      <SetPassword uid={params?.uid} />
    </>
  );
};

export default page;
