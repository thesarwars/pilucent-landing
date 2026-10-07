import UpdateEstimate from "../_components/UpdateEstimate";

const Page = async (
    props: {
        params: Promise<{ uid: string }>
      }
) => {
    const params = await props.params;
    return (
        <div>
            <UpdateEstimate uid={params?.uid}/>
        </div>
    );
};

export default Page;