import { Controller, Get, Post, Body } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    @Post('calculate-salary')
    calculateSalary(@Body() employee: any) {
        return this.payrollService.calculateSalary(employee);
    }

    @Post('distribute-profits')
    distributeProfits(@Body() { profits, shareholders }: { profits: number; shareholders: any[] }) {
        return this.payrollService.distributeShareholderProfits(profits, shareholders);
    }

    @Post('add-record')
    addPayrollRecord(@Body() record: any) {
        return this.payrollService.addPayrollRecord(record);
    }

    @Get('records')
    getPayrollRecords() {
        return this.payrollService.getPayrollRecords();
    }
}