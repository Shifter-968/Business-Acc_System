import { Injectable } from '@nestjs/common';

@Injectable()
export class PayrollService {
    private payrollRecords = [];

    calculateSalary(employee: any) {
        // Example calculation logic
        let baseSalary = employee.baseSalary || 0;
        let bonuses = employee.bonuses || 0;
        return baseSalary + bonuses;
    }

    distributeShareholderProfits(profits: number, shareholders: any[]) {
        return shareholders.map(shareholder => {
            const share = (profits * shareholder.percentage) / 100;
            return { shareholderId: shareholder.id, share };
        });
    }

    addPayrollRecord(record: any) {
        this.payrollRecords.push(record);
        return record;
    }

    getPayrollRecords() {
        return this.payrollRecords;
    }
}