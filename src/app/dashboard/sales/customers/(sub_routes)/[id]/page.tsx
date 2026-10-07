import CustomerDetails from "../../_components/CustomerDetails";

const Page = async (
  props: {
    params: Promise<{ id: string }>
  }
) => {
  const params = await props.params;


  return (
    <>
      <CustomerDetails id={params.id} />
    </>
  );
};

export default Page;
