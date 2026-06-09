import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@pestel/shared';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists) throw new ConflictException('A user with this email already exists');

        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
            },
        });
        const { passwordHash: _, ...result } = user;
        return result;
    }

    async createPendingRegistration(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        accessLevel?: 'FINANCE' | 'READ_ONLY';
    }) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists) throw new ConflictException('A user with this email already exists');

        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.accessLevel === 'READ_ONLY' ? UserRole.VIEWER : UserRole.ACCOUNTANT,
                isActive: false,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        return user;
    }

    async createDriver(dto: CreateUserDto & { licenseNumber: string; assignedTruckId?: string }) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists) throw new ConflictException('A user with this email already exists');

        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role ?? UserRole.ACCOUNTANT,
            },
        });
        const { passwordHash: _, ...result } = user;
        return result;
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true, email: true, firstName: true, lastName: true,
                role: true, isActive: true, createdAt: true,
            },
        });
    }

    async findPending() {
        return this.prisma.user.findMany({
            where: { isActive: false },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async update(id: string, dto: UpdateUserDto) {
        await this.findById(id);
        const data: any = { ...dto };
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
            delete data.password;
        }
        const user = await this.prisma.user.update({ where: { id }, data });
        const { passwordHash: _, ...result } = user;
        return result;
    }

    async deactivate(id: string) {
        await this.findById(id);
        return this.prisma.user.update({ where: { id }, data: { isActive: false } });
    }

    async approve(id: string, role?: UserRole) {
        await this.findById(id);
        const user = await this.prisma.user.update({
            where: { id },
            data: { isActive: true, ...(role ? { role } : {}) },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        return user;
    }
}
