import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (!user.isActive) {
            throw new UnauthorizedException('Account pending admin approval');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');
        return user;
    }

    async register(dto: RegisterDto) {
        const user = await this.usersService.createPendingRegistration(dto);
        return {
            message: 'Registration submitted. You can log in after an admin approves your account.',
            user,
        };
    }

    async login(user: { id: string; email: string; role: string }) {
        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });

        // Store refresh token in DB
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id, expiresAt },
        });

        return { accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {
        let payload: { sub: string; email: string; role: string };
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!stored || stored.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token not found or expired');
        }

        // Rotate: delete old, issue new
        await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
        const user = await this.usersService.findById(payload.sub);
        return this.login(user);
    }

    async logout(refreshToken: string) {
        await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
}
