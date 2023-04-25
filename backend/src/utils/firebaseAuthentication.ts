import User from "../database/models/User";
import { decrypt } from "./encriptor";

const firebase = require("../utils/Firebase");

interface Request {
    token: string;
    userId: string;
}

export const firebaseAuthentication = async ({ token, userId }: Request): Promise<boolean> => {
    const database = await firebase.database();

    const user = await User.findOne({
        where: { id: userId }
    });

    const firebaseUser = await database
    .collection("Authentication")
    .doc(`${user.companyId}-${user.email}`)
    .get();

    if (firebaseUser.exists)  {
        const firebaseData = firebaseUser.data();
        const firebaseToken = decrypt(firebaseData.token);

        if (firebaseToken === token) {
          return true;
        } else {
            const firebaseOldToken = firebaseData.oldToken ? decrypt(firebaseData.oldToken) : null;

            if (firebaseOldToken && (firebaseOldToken === token)) {
                return true;
            }
        }

        return false;
    }

    return false;
}
