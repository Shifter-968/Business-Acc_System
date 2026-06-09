import { Injectable } from '@nestjs/common';

@Injectable()
export class TripsService {
    private trips = [];

    findAll() {
        return this.trips;
    }

    findOne(id: string) {
        return this.trips.find(trip => trip.id === id);
    }

    create(trip: any) {
        this.trips.push(trip);
        return trip;
    }

    update(id: string, updateData: any) {
        const tripIndex = this.trips.findIndex(trip => trip.id === id);
        if (tripIndex > -1) {
            this.trips[tripIndex] = { ...this.trips[tripIndex], ...updateData };
            return this.trips[tripIndex];
        }
        return null;
    }

    remove(id: string) {
        const tripIndex = this.trips.findIndex(trip => trip.id === id);
        if (tripIndex > -1) {
            return this.trips.splice(tripIndex, 1);
        }
        return null;
    }
}