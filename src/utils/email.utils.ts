import path from 'path'
import nodemailer from 'nodemailer'


export const emailContentDir = path.resolve(__dirname, '../../public/email/')
// Configuración de transporte SMTP
export const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: parseInt(process.env.MAILER_PORT || '587', 10),
  secure: process.env.MAILER_PORT === '465', // Si el puerto es 465, usa conexión segura
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD
  }
})