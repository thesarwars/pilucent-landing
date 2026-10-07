import UpdateCheque from "../_components/UpdateCheque";

const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdateCheque uid={params?.uid}/>
        </>
    );
};

export default page;