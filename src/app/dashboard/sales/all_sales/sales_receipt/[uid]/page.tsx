import UpdateReceipt from "../_components/UpdateReceipt";

const page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    console.log(params?.uid)
    return (
        <div>
            <UpdateReceipt uid={params?.uid}/>
        </div>
    );
};

export default page;