import { Request, Response } from 'express';
import { authServices, emailServices } from '../../services'
import { generateJWT } from '../../utils';
import { decodeJWT } from '../../utils/generateJWT.utils';

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' })
        }

        const logedUser = await authServices.login(email, password)
        // res.cookie('access_token', logedUser.token)

        return res.status(200).json({ message: 'User logged in successfully', user: logedUser })
    } catch (error: any) { 
        const errorMessage = error.message || 'Internal server error' 
        
        return res.status(500).json({ message: errorMessage }) 
    }
}


export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const email = req.body.email;
        const registeredUser = await authServices.register(req.body);
        const tokenEmail = await generateJWT({ email:email},10000); // generate token with id_user and expiration time of 10 minutes
        const sending = await emailServices.SendVerifyAccountEmail(email, tokenEmail)

        console.log("- Un nuevo usuario se ha registrado en el sistema.", registeredUser);
        // Respuesta exitosa
        return res.status(200).json({
            message: 'Usuario creado exitosamente, verifica tu correo electronico para  verificar tu cuenta ',
            user: registeredUser.data,
            send: sending,
        });
    } catch (error:any) {
        console.error('Error creating user:', error)
        const errorMessage = error.message || 'Internal server error'
        return res.status(500).json({ message: errorMessage })
    }
};


export const forgotPasswordController = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body // get email from request body
        const user = await authServices.findUserExistService(email) // get user from database
        if (!user) {return res.status(404).json({ message: 'User don`t found' })} // validation to user exists
        const token = await generateJWT({ id:user.id_user},10000); // generate token with id_user and expiration time of 10 minutes
        const sendMail = await emailServices.sendResetPasswordMail(email, token)// Enviar correo electrónico con el token
        return res.status(200).json({ message: `${sendMail} ${email}` })
    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
    }
}

export const resetPasswordController = async (req: Request, res: Response): Promise<any> => {
    try {
        const { token } = req.params
        const { newPassword, confirmPassword } = req.body
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' })
          }

        const decodedToken = await decodeJWT(token) // decode token
        const resetPassword = await authServices.restorePassword(decodedToken.id, newPassword, confirmPassword)
        res.status(200).json({message: 'Password reset successfully', resetPassword})
    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
    }
}

export const ValidateAccountEmailController = async (req: Request, res: Response): Promise<any> => {
    try {
        const email = req.query.email as string
        const token = await generateJWT({ email:email},10000); // generate token with id_user and expiration time of 10 minutes
        const sending = await emailServices.SendVerifyAccountEmail(email, token)
        return res.status(200).json({ message: `${sending} ${email}` })

    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
        
    }
}

export const validateEmailController = async (req: Request, res: Response): Promise<any> => {
    try {
        const decodedToken = await decodeJWT(req.query.token as string)
        const verify = await authServices.VerifyEmailService(decodedToken.email)
        if (!verify) { return res.status(404).json({ message: 'Token invalido o caducado' })}
        const frontendUrl = `${process.env.FRONTEND_URL}`; // ! poner ruta del front 
        return res.redirect(frontendUrl);    
    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
        
    }
}

export const authenticateToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; 
        if (!token) return res.status(401).json({ message: 'No token provided' })
        const decoded = await decodeJWT(token);
        if (!decoded || !decoded.id) return res.status(401).json({ message: 'Invalid token' })            
        const user = await authServices.authenticateTokenService(decoded)
        return res.status(200).json({ user, token })
    } catch (error) {
        console.error('Error en /me:', error);
        return res.status(500).json({ message: 'Error al obtener usuario' });
    }
  }
