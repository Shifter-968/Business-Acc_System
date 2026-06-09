import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { JournalModule } from './modules/journal/journal.module';
import { VatModule } from './modules/vat/vat.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TrucksModule } from './modules/trucks/trucks.module';
import { TripsModule } from './modules/trips/trips.module';
import { PayrollModule } from './modules/payroll/payroll.module';

@Module({
    imports: [
        // Config — loads .env file
        ConfigModule.forRoot({ isGlobal: true }),

        // Rate limiting — 100 requests per 60 seconds per IP
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

        // Database
        PrismaModule,

        // Feature modules
        AuthModule,
        UsersModule,
        ClientsModule,
        SuppliersModule,
        AccountsModule,
        InvoicesModule,
        QuotesModule,
        ExpensesModule,
        PaymentsModule,
        JournalModule,
        VatModule,
        ReportsModule,
        SettingsModule,
        TrucksModule,
        TripsModule,
        PayrollModule,
    ],
})
export class AppModule { }
