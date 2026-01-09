import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto, UserListQueryDto, UserResponseDto } from './dto';
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    private formatUser;
}
