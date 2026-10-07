import UpdatePayBill from "../_components/UpdatePayBill";


const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdatePayBill uid={params?.uid}/>
        </>
    );
};

export default page;