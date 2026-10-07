import UpdateBillPayment from "../_components/UpdateBillPayment";


const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdateBillPayment uid={params?.uid}/>
        </>
    );
};

export default page;