import rules from "../../rules";

const check = (role, action, data) => {
	const permissions = rules[role];
	if (!permissions) {
		// role is not present in the rules
		return false;
	}

	const staticPermissions = permissions.static;

	if (staticPermissions && staticPermissions.includes(action)) {
		// static rule not provided for action
		return true;
	}

	const dynamicPermissions = permissions.dynamic;

	if (dynamicPermissions) {
		const permissionCondition = dynamicPermissions[action];
		if (!permissionCondition) {
			// dynamic rule not provided for action
			return false;
		}

		return permissionCondition(data);
	}
	return false;
};

const Can = ({ role, perform, data, yes, no }) =>
	check(role, perform, data) ? yes() : no();

Can.defaultProps = {
	yes: () => null,
	no: () => null,
};

export { Can };
