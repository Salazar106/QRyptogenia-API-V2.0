import { Router }   from 'express'
import authRoutes   from './auth/auth.routes'
import rolesRoutes  from './roles/roles.routes'

import { validateJWT } from '../middlewares/validateJWT.middleware'

const router = Router()

router.use('/auth', authRoutes)
router.use('/roles', validateJWT, rolesRoutes)

export default router 