import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TrucksService } from './trucks.service';

@Controller('trucks')
export class TrucksController {
    constructor(private readonly trucksService: TrucksService) { }

    @Get()
    findAll() {
        return this.trucksService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.trucksService.findOne(id);
    }

    @Post()
    create(@Body() createTruckDto: any) {
        return this.trucksService.create(createTruckDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTruckDto: any) {
        return this.trucksService.update(id, updateTruckDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.trucksService.remove(id);
    }
}