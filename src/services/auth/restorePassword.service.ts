import bcrypt from 'bcryptjs'
import { db } from '../../config'


export const restorePassword = async(id_user:string, newPassword:string, confirmPassword:string) => {
    try {

        if (!id_user) {throw new Error(`token is required`)}// validate required field
        if (!newPassword) {throw new Error(`password is required`)}// validate required field
        if (!confirmPassword) {throw new Error(`confirmPassword is required`)}// validate required field

        
        const user = await db.users.findFirst({
            where: { id_user },
            include: {credentials: true,},
        })// find user and credential by id
        
        if (!user) {throw new Error(`User not found.`);} 
        
        const passwordValidation = await bcrypt.compare(newPassword, user.credentials[0].password) // validate if password is the same as old password
        
        if(passwordValidation){throw new Error(`The password cannot be the same as the current one`);}

        const hashedPassword = await bcrypt.hash(newPassword, 10)// hash new password
        const updated= await db.credentials.update({
            where: { user_id: user.credentials[0].user_id },
            data: {
                password: hashedPassword
            }
        })// update password
        return updated // return updated password
        
    } catch (error:any) {
        throw new Error(error.message || 'Unknown error')
    }
    

}