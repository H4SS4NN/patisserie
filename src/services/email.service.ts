import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';
import { Order, OrderStatus } from '../entities/Order.entity';

config();

const USE_SENDGRID = process.env.USE_SENDGRID === 'true';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@patisserie.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

if (USE_SENDGRID && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let transporter: nodemailer.Transporter | null = null;

if (!USE_SENDGRID) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export class EmailService {
  static async sendOrderConfirmation(order: Order): Promise<void> {
    if (!order.client_email) return;

    const subject = `Confirmation de votre commande ${order.numero_commande}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Merci pour votre commande !</h2>
          <p>Bonjour ${order.client_name},</p>
          <p>Nous avons bien reçu votre commande <strong>${order.numero_commande}</strong>.</p>
          <h3>Détails de la commande :</h3>
          <ul>
            ${order.items
              .map(
                (item) =>
                  `<li>${item.name} x${item.qty} - ${(item.price * item.qty / 100).toFixed(2)}€</li>`
              )
              .join('')}
          </ul>
          <p><strong>Total : ${(order.total_price / 100).toFixed(2)}€</strong></p>
          <p><strong>Méthode de paiement : ${order.payment_method}</strong></p>
          <p><strong>Date de retrait/livraison : ${new Date(order.pickup_or_delivery_date).toLocaleString('fr-FR')}</strong></p>
          ${order.notes ? `<p><strong>Vos notes :</strong> ${order.notes}</p>` : ''}
          <p>Nous vous contacterons bientôt pour confirmer les détails.</p>
          <p>Cordialement,<br>L'équipe de la pâtisserie</p>
        </body>
      </html>
    `;

    await this.sendEmail(order.client_email, subject, html);
  }

  static async sendOrderStatusUpdate(order: Order, newStatus: OrderStatus): Promise<void> {
    if (!order.client_email) return;

    const statusLabels: Record<OrderStatus, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      EN_PREPARATION: 'En préparation',
      EN_CUISSON: 'En cuisson',
      PRETE: 'Prête',
      LIVREE: 'Livrée',
      CANCELLED: 'Annulée',
    };

    const subject = `Mise à jour de votre commande ${order.numero_commande}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Mise à jour de votre commande</h2>
          <p>Bonjour ${order.client_name},</p>
          <p>Le statut de votre commande <strong>${order.numero_commande}</strong> a été mis à jour.</p>
          <p><strong>Nouveau statut : ${statusLabels[newStatus]}</strong></p>
          <p>Nous vous tiendrons informé(e) de l'avancement de votre commande.</p>
          <p>Cordialement,<br>L'équipe de la pâtisserie</p>
        </body>
      </html>
    `;

    await this.sendEmail(order.client_email, subject, html);
  }

  static async sendNewOrderAlert(order: Order): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';
    if (!adminEmail) return;

    const subject = `Nouvelle commande ${order.numero_commande}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nouvelle commande reçue</h2>
          <p>Une nouvelle commande a été passée :</p>
          <ul>
            <li><strong>Numéro :</strong> ${order.numero_commande}</li>
            <li><strong>Client :</strong> ${order.client_name}</li>
            <li><strong>Téléphone :</strong> ${order.client_phone}</li>
            <li><strong>Email :</strong> ${order.client_email || 'N/A'}</li>
            <li><strong>Total :</strong> ${(order.total_price / 100).toFixed(2)}€</li>
            <li><strong>Date souhaitée :</strong> ${new Date(order.pickup_or_delivery_date).toLocaleString('fr-FR')}</li>
          </ul>
          <p><a href="${APP_URL}/admin/orders/${order.id}">Voir la commande</a></p>
        </body>
      </html>
    `;

    await this.sendEmail(adminEmail, subject, html);
  }

  private static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      if (USE_SENDGRID) {
        await sgMail.send({
          to,
          from: SMTP_FROM,
          subject,
          html,
        });
      } else if (transporter) {
        await transporter.sendMail({
          from: SMTP_FROM,
          to,
          subject,
          html,
        });
      } else {
        console.warn('Email service not configured. Skipping email send.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw - email failures shouldn't break the app
    }
  }
}

