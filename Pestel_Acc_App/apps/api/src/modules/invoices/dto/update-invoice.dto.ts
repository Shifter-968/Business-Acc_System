// ─── UpdateInvoiceDto ─────────────────────────────────────────────────────────
//
// TEACHING NOTE:
// PartialType(CreateInvoiceDto) automatically makes ALL fields optional.
// This means when updating an invoice, you only send the fields that changed.
// For example: { notes: "Updated note" } — only notes changes, nothing else breaks.
// ─────────────────────────────────────────────────────────────────────────────

import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
