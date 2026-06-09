import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
    constructor(private readonly tripsService: TripsService) { }

    @Get()
    findAll() {
        return this.tripsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tripsService.findOne(id);
    }

    @Post()
    create(@Body() createTripDto: any) {
        return this.tripsService.create(createTripDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTripDto: any) {
        return this.tripsService.update(id, updateTripDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tripsService.remove(id);
    }
}