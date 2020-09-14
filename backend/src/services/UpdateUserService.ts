import { getRepository } from "typeorm";
import * as Yup from "yup";

import AppError from "../errors/AppError";
import User from "../models/User";

interface UserData {
	email?: string;
	password?: string;
	name?: string;
	profile?: string;
}

interface Request {
	userData: UserData;
	userId: string;
}

const UpdateUserService = async ({
	userData,
	userId,
}: Request): Promise<User | undefined> => {
	const usersRepository = getRepository(User);

	const schema = Yup.object().shape({
		name: Yup.string().min(2),
		email: Yup.string().email(),
		password: Yup.string(),
	});

	const { email, password, name } = userData;

	try {
		await schema.validate({ email, password, name });
	} catch (err) {
		throw new AppError(err.message);
	}

	const user = await usersRepository.findOne({
		where: { id: userId },
		select: ["name", "id", "email", "profile"],
	});

	if (!user) {
		throw new AppError("No user found with this ID.", 404);
	}

	const teste = await usersRepository.update(userId, {
		email,
		passwordHash: password,
		name,
	});

	console.log(teste);

	delete user.passwordHash;

	return user;
};

export default UpdateUserService;
