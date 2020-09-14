import { getRepository, Raw } from "typeorm";

import User from "../models/User";

interface Request {
	searchParam?: string;
	pageNumber?: number;
}

interface Response {
	users: User[];
	count: number;
	hasMore: boolean;
}

const ListUsersService = async ({
	searchParam = "",
	pageNumber = 1,
}: Request): Promise<Response> => {
	const usersRepository = getRepository(User);

	const whereCondition = [
		{
			name: Raw(
				alias => `LOWER(${alias}) Like '%${searchParam.toLowerCase()}%'`
			),
		},
		{
			email: Raw(
				alias => `LOWER(${alias}) Like '%${searchParam.toLowerCase()}%'`
			),
		},
	];
	const take = 20;
	const skip = take * (pageNumber - 1);

	const [users, count] = await usersRepository.findAndCount({
		where: whereCondition,
		select: ["name", "id", "email", "profile"],
		skip,
		take,
		order: { createdAt: "DESC" },
	});

	const hasMore = count > skip + users.length;

	return {
		users,
		count,
		hasMore,
	};
};

export default ListUsersService;
