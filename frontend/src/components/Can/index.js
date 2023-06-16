import React, { useEffect, useState } from "react";

const Can = ({ permission, profile, item }) => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		function checkPermission() {
			if (!profile) return;
		
			const permissions = JSON.parse(profile.permissions);
		
			if (permissions === null) {
				setShow(true);
				return;
			}

			if (permissions.includes(permission)) {
				setShow(true);
				return;
			}
		}
	
		checkPermission();
	}, [permission])

	return (
		<>
			{show && item}
		</>
	)
}

export default Can;
