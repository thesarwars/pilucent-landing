import UpdatePurchaseOrder from "../_components/UpdatePurchaseOrder";

const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdatePurchaseOrder uid={params?.uid}/>
        </>
    );
};

export default page;