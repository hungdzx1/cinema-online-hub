import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
@Module({
  providers: [MailService],
  exports: [MailService], // ⚠️ QUAN TRỌNG: export để module khác (auth) dùng được
})
export class MailModule {}
