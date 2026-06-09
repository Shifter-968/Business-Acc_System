import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load .env file explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // ─── Admin User ──────────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    await prisma.user.upsert({
        where: { email: 'admin@fannielogistics.co.za' },
        update: {},
        create: {
            email: 'admin@fannielogistics.co.za',
            passwordHash: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
        },
    });
    console.log('✓ Admin user created: admin@fannielogistics.co.za / Admin123!');

    // ─── Company Settings ────────────────────────────────────────────────────
    await prisma.companySettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            companyName: 'Fannie Logistics',
            country: 'South Africa',
            vatRate: 15,
            invoicePrefix: 'INV',
            quotePrefix: 'TRQ',
        },
    });
    console.log('✓ Company settings created');

    // ─── Chart of Accounts (Standard South African Structure) ────────────────
    const accounts = [
        // ASSETS
        { code: '1000', name: 'Cash on Hand', type: 'ASSET', isSystem: true },
        { code: '1010', name: 'Bank Account (Cheque)', type: 'ASSET', isSystem: true },
        { code: '1100', name: 'Accounts Receivable', type: 'ASSET', isSystem: true },
        { code: '1200', name: 'VAT Input (Receivable)', type: 'ASSET', isSystem: true },
        { code: '1500', name: 'Office Equipment', type: 'ASSET', isSystem: false },
        { code: '1510', name: 'Computers & Technology', type: 'ASSET', isSystem: false },

        // LIABILITIES
        { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', isSystem: true },
        { code: '2100', name: 'VAT Output (Payable)', type: 'LIABILITY', isSystem: true },
        { code: '2200', name: 'Income Received in Advance', type: 'LIABILITY', isSystem: false },

        // EQUITY
        { code: '3000', name: "Owner's Equity", type: 'EQUITY', isSystem: true },
        { code: '3100', name: 'Retained Earnings', type: 'EQUITY', isSystem: true },

        // INCOME
        { code: '4000', name: 'Transport Revenue', type: 'INCOME', isSystem: false },
        { code: '4010', name: 'Trip Surcharge Revenue', type: 'INCOME', isSystem: false },
        { code: '4020', name: 'Workshop Service Revenue', type: 'INCOME', isSystem: false },
        { code: '4900', name: 'Other Income', type: 'INCOME', isSystem: false },

        // EXPENSES
        { code: '5000', name: 'Salaries, Wages & Allowances', type: 'EXPENSE', isSystem: false },
        { code: '5010', name: 'Rent & Office Space', type: 'EXPENSE', isSystem: false },
        { code: '5020', name: 'Telephone & Internet', type: 'EXPENSE', isSystem: false },
        { code: '5030', name: 'Fuel, Tolls & Route Costs', type: 'EXPENSE', isSystem: false },
        { code: '5040', name: 'Fleet Maintenance & Repairs', type: 'EXPENSE', isSystem: false },
        { code: '5050', name: 'Printing & Stationery', type: 'EXPENSE', isSystem: false },
        { code: '5060', name: 'Tyres, Spares & Consumables', type: 'EXPENSE', isSystem: false },
        { code: '5070', name: 'Bank Charges', type: 'EXPENSE', isSystem: false },
        { code: '5080', name: 'Professional Fees', type: 'EXPENSE', isSystem: false },
        { code: '5900', name: 'Miscellaneous Expenses', type: 'EXPENSE', isSystem: false },
    ];

    for (const account of accounts) {
        await prisma.account.upsert({
            where: { code: account.code },
            update: {},
            create: account as any,
        });
    }
    console.log(`✓ Chart of accounts seeded (${accounts.length} accounts)`);

    console.log('\nSeeding complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
