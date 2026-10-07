import UpdateCredit from "../_components/UpdateCredit";

const page = async (
  props: {
      params: Promise<{ uid: string }>
    }
) => {
  const params = await props.params;
  return (
      <>
        <UpdateCredit uid={params?.uid}/>  
      </>
  );
};

export default page;