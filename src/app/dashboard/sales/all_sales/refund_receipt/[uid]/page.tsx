import UpdateRefund from "../_components/UpdateRefund";

const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdateRefund uid={params?.uid}/>
        </>
    );
};

export default page;