import UpdateSupplierCredit from "../_components/UpdateSupplierCredit";

const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdateSupplierCredit uid={params?.uid}/>
        </>
    );
};

export default page;