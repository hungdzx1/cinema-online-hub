import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
// Sửa dòng 2 thành đường dẫn trỏ tới file service (.ts) thay vì .module
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Tạo "người gửi" — kết nối tới Gmail SMTP
    // ⚠️ KHÔNG hardcode giá trị thật — luôn đọc từ process.env (file .env)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD, // App Password 16 ký tự, không phải mật khẩu Gmail thường
      },
    });
  }

  // Gửi email chứa mã/link reset mật khẩu
  async sendResetPasswordEmail(
    toEmail: string,
    resetToken: string,
  ): Promise<void> {
    // ⚠️ Đổi link này thành domain FRONTEND thật của bạn khi deploy
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from: `"Phimplay24" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: 'Đặt lại mật khẩu Phimplay24',
        html: `
          <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Phimplay24.</p>
          <p>Mã đặt lại mật khẩu của bạn:</p>
          <h2>${resetToken}</h2>
          <p>Hoặc bấm vào link sau (link hết hạn sau 15 phút):</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        `,
      });
      this.logger.log(`Đã gửi email reset mật khẩu tới: ${toEmail}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Gửi email thất bại tới ${toEmail}: ${errorMessage}`);
      throw error;
    }
  }
}
