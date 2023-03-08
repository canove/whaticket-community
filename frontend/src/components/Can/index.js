// import rules from "../../rules";

// const check = (role, action, data) => {
// 	let permissions = [];

// 	try {
// 		permissions = JSON.parse(role.permissions);
// 	} catch {
// 		return false;
// 	}

// 	if (permissions && permissions.includes(action)) {
// 		return true;
// 	}

// 	return false;

// 	// const permissions = rules[role];
// 	// if (!permissions) {
// 	// 	// role is not present in the rules
// 	// 	return false;
// 	// }

// 	// const staticPermissions = permissions.static;

// 	// if (staticPermissions && staticPermissions.includes(action)) {
// 	// 	// static rule not provided for action
// 	// 	return true;
// 	// }

// 	// const dynamicPermissions = permissions.dynamic;

// 	// if (dynamicPermissions) {
// 	// 	const permissionCondition = dynamicPermissions[action];
// 	// 	if (!permissionCondition) {
// 	// 		// dynamic rule not provided for action
// 	// 		return false;
// 	// 	}

// 	// 	return permissionCondition(data);
// 	// }
// 	// return false;
// };

// const Can = ({ role, perform, data, yes, no }) =>
// 	check(role, perform, data) ? yes() : no();

// Can.defaultProps = {
// 	yes: () => null,
// 	no: () => null,
// };

import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const Can = ({ permission, item }) => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const checkPermission = async () => {
			try {
				const { data } = await api.get("/profile/check", {
					params: { permission }
				});

				setShow(data);
			} catch (err) {
				toastError(err);
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
