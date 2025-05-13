import { Router } from 'express'
import authRoutes from './auth/auth.routes'

import { validateJWT } from '../middlewares/validateJWT.middleware'

const router = Router()

router.use('/auth', authRoutes)


export default router 