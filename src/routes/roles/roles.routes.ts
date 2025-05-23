import { Router }                               from 'express'
import { rolesController }                      from '../../controllers'
import { validate }                             from '../../middlewares/validateSchemas.middleware'
import { createRoleSchema, updateRoleSchema }   from '../../schemas/roles.schema';

const router = Router()

const { 
    CreateRoleController,
    GetAllRolesController,
    UpdateRoleController,
} = rolesController

router.post('/create',  validate(createRoleSchema), CreateRoleController)
router.put('/update',   validate(updateRoleSchema), UpdateRoleController)
router.get('/getAll',   GetAllRolesController)


export default router