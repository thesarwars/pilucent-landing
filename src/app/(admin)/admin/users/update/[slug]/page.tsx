// import RoleUpdate from '@/app/dashboard/admin/roles/role_update/RoleUpdate';
import React from 'react';

const page = async (props: { params: Promise<{ slug: string; }>}) => {
    const params = await props.params;
    const { slug } = params;
    return (
		<div>
			{/* <RoleUpdate slug={slug}></RoleUpdate> */}
		</div>
	);
};

export default page;