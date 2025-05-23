import { db } from "../../config"

export const GetAllRolesService = () => {
    try {
        const response = db.role.findMany()
        if (!response) throw new Error('No roles found')
        
        return response
    } catch (error) {
        return false
    } 
}
