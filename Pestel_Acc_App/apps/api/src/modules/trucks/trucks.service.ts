import { Injectable } from '@nestjs/common';

@Injectable()
export class TrucksService {
    private trucks = [];

    findAll() {
        return this.trucks;
    }

    findOne(id: string) {
        return this.trucks.find(truck => truck.id === id);
    }

    create(truck: any) {
        this.trucks.push(truck);
        return truck;
    }

    update(id: string, updateData: any) {
        const truckIndex = this.trucks.findIndex(truck => truck.id === id);
        if (truckIndex > -1) {
            this.trucks[truckIndex] = { ...this.trucks[truckIndex], ...updateData };
            return this.trucks[truckIndex];
        }
        return null;
    }

    remove(id: string) {
        const truckIndex = this.trucks.findIndex(truck => truck.id === id);
        if (truckIndex > -1) {
            return this.trucks.splice(truckIndex, 1);
        }
        return null;
    }
}