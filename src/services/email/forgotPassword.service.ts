import fs from 'fs'
import path from 'path'
import { emailContentDir, transporter } from '../../utils/email.utils'


export const sendResetPasswordMail = async (email:string, resetToken:string) => {
    try {
      const filePath = path.join(emailContentDir, 'base-email.html')
      let htmlContent = fs.readFileSync(filePath, 'utf8')
  
      const resetpasswordurl = process.env.FRONTEND_URL
      const resetLink = `${resetpasswordurl}/reset-password/?token=${resetToken}`
  
      // Reemplazo de la plantilla con el enlace de restablecimiento
      htmlContent = htmlContent.replace('{{resetLink}}', resetLink)
      htmlContent = htmlContent.replace('{{tittle}}', 'Restablecer Contraseña')
      htmlContent = htmlContent.replace('{{description}}', 'Hemos recibido una solicitud para restablecer tu contraseña. Si no hiciste esta solicitud, puedes ignorar este mensaje.')
      htmlContent = htmlContent.replace('{{buttonText}}', 'Restablecer Contraseña')

      const logoPath = path.join(__dirname, '../../..', 'public/images/Logo.png')
      const mailOptions = {
        to: email,
        from: `PokeAPI <${process.env.MAILER_USER}>`,
        subject: 'Restablecer contraseña PokeAPI',
        html: htmlContent.replace(
          '{{logo}}',
          'cid:logoImage' // Referencia al Content-ID del logo
        ),
        attachments: [
          {
            filename: 'Logo.png',
            path: logoPath, // Ruta al archivo del logo
            cid: 'logoImage' // Content-ID para incrustar en el HTML
          }
        ]
      }
  
      // Enviar correo y manejar errores
      await transporter.sendMail(mailOptions)
      console.log('Reset link sent to user email.')
      return 'Reset password link sent to '
    } catch (error:any ) {
      console.error('Error sending user request password email:', error)
      throw new Error(`Error sending email: ${error.message}`)
    }
  }