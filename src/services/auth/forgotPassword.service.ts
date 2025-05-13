import { db } from '../../config'


export const findUserExistService = (email:string) => {
    try {
        const response = db.users.findFirst({where: { email }})
        
        return !response ? false: response
    } catch (error) {
        return false
    } 
}
