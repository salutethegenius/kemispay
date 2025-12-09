import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || "",
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const command = new SendEmailCommand({
        Source: "waitlist@kemispay.com",
        Destination: {
          ToAddresses: [options.to],
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: options.html,
              Charset: "UTF-8",
            },
          },
        },
      });

      const response = await sesClient.send(command);
      console.log("Email sent successfully:", response.MessageId);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  static async sendWaitlistConfirmation(
    name: string,
    email: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 8px; margin-bottom: 20px; }
            .content p { margin: 10px 0; }
            .footer { text-align: center; color: #64748b; font-size: 12px; }
            .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to KemisPay</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for joining the KemisPay waitlist! We're excited to have you on board.</p>
              <p>We're working hard to bring a payment solution that transforms how Bahamian businesses accept payments. You'll be among the first to know when we launch.</p>
              <p>In the meantime, if you have any questions or suggestions, feel free to reach out to us.</p>
              <p><strong>Stay tuned!</strong></p>
              <p>
                Best regards,<br />
                The KemisPay Team
              </p>
            </div>
            <div class="footer">
              <p>© 2025 KemisPay LLC, a subsidiary of Kemis Group of Companies Inc.</p>
              <p>Made for the Bahamas 🇧🇸</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "You're In! Welcome to KemisPay",
      html,
    });
  }
}
