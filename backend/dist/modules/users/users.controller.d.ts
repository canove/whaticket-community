import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserListQueryDto, UserResponseDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: UserListQueryDto): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<UserResponseDto>;
    create(dto: CreateUserDto): Promise<UserResponseDto>;
    update(id: number, dto: UpdateUserDto): Promise<UserResponseDto>;
    delete(id: number): Promise<void>;
}
