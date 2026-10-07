import UpdateInvoice from "../_components/UpdateInvoice";

const Page = async (
  props: {
    params: Promise<{ uid: string }>
  }
) => {
  const params = await props.params;

  return (
    <>
    <UpdateInvoice uid={params.uid}/>
    </>
  );
};

export default Page;
