import rules from "../../rules";
import type { IRules } from "../../types/Rules";
import type { JSX } from "react";

const check = (role: keyof IRules, action: string, data: any) => {
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

  const dynamicPermissions = permissions.dynamic as {
    [key: string]: (data: any) => boolean;
  };

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

type CanProps = {
  role: keyof IRules;
  perform: string;
  data?: any;
  yes: () => JSX.Element;
  no: () => JSX.Element;
};

const Can = ({ role, perform, data, yes, no }: CanProps) =>
  check(role, perform, data) ? yes() : no();

Can.defaultProps = {
  yes: () => null,
  no: () => null,
};

export { Can };
