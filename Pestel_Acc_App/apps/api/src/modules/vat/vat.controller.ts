import { Controller } from '@nestjs/common';
import { VatService } from './vat.service';

@Controller('vat')
export class VatController {
  constructor(private readonly vatService: VatService) {}
}
