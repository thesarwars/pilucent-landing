import UpdateExpense from "../_components/UpdateExpense";

const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <>
            <UpdateExpense uid={params?.uid}/>
        </>
    );
};

export default page;