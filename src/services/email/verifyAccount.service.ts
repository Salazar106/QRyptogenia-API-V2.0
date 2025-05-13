import fs from 'fs'
import path from 'path'
import { emailContentDir, transporter } from '../../utils/email.utils'


export const SendVerifyAccountEmail = async (email:string, resetToken:string) => {
    try {
      const filePath = path.join(emailContentDir, 'base-email.html')
      let htmlContent = fs.readFileSync(filePath, 'utf8')
  
      const URLBASE = process.env.BACKEND_URL
      const Link = `${URLBASE}/auth/verifyEmailAcount/?token=${resetToken}`
    //   const Link = `www.youtube.com`
      
  
      // Reemplazo de la plantilla con el enlace de restablecimiento
      htmlContent = htmlContent.replace('{{resetLink}}', Link)
      htmlContent = htmlContent.replace('{{tittle}}', 'Verifica tu cuenta PokeApi')
      htmlContent = htmlContent.replace('{{description}}', 'Hemos recibido una solicitud para verificar tu cuenta en PokeAPI. Si no hiciste esta solicitud, puedes ignorar este mensaje.')
      htmlContent = htmlContent.replace('{{buttonText}}', 'Verificar Cuenta')

      const logoPath = path.join(__dirname, '../../..', 'public/images/Logo.png')
      const mailOptions = {
        to: email,
        from: `PokeAPI <${process.env.MAILER_USER}>`,
        subject: 'Verificar tu cuenta PokeAPI',
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
      console.log('verification link sent to user email.')
      return 'Verification link sent to'
    } catch (error:any ) {
      console.error('Error sending user request password email:', error)
      throw new Error(`Error sending email: ${error.message}`)
    }
  }