import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    create(dto: CreateClientDto) {
        return this.prisma.client.create({ data: dto });
    }

    findAll(search?: string) {
        return this.prisma.client.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { contactPerson: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const client = await this.prisma.client.findUnique({ where: { id } });
        if (!client) throw new NotFoundException('Client not found');
        return client;
    }

    async update(id: string, dto: UpdateClientDto) {
        await this.findOne(id);
        return this.prisma.client.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.client.update({ where: { id }, data: { isActive: false } });
    }

    async getBalance(id: string) {
        await this.findOne(id);
        const result = await this.prisma.invoice.aggregate({
            where: { clientId: id, status: { notIn: ['VOID'] } },
            _sum: { amountDue: true },
        });
        return { clientId: id, outstanding: result._sum.amountDue ?? 0 };
    }
}
