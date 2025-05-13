import { Router } from 'express'
import { authController } from '../../controllers'
import { validate } from '../../middlewares/validateSchemas.middleware'
import { registerUserSchema } from '../../schemas/user.schema';

const router = Router()

const { 
    login, 
    register, 
    forgotPasswordController, 
    resetPasswordController, 
    ValidateAccountEmailController,
    validateEmailController,
    authenticateToken
} = authController

router.post('/register', validate(registerUserSchema), register)
router.post('/login', login)
router.post('/forgotPassword', forgotPasswordController)
router.post('/resetPassword/:token', resetPasswordController)
router.get('/sendVerifyAcountEmail', ValidateAccountEmailController)// can use in resend emails case 
router.get('/verifyEmailAcount', validateEmailController)
router.get('/authenticateToken', authenticateToken)

export default router