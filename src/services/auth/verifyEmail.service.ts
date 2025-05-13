import { db } from "../../config";

export const VerifyEmailService = async(email:string)=>{
    try {
        if (!email) {throw new Error(`email is required`)}// validate required field
        const user = await db.users.findFirst({
            where: { email },
        })
        if (!user) {throw new Error(`User not found`)}// validate user exist

        const account = await db.users.update({
            where: { email: email },
            data: {
                is_verified: true
            }
        })

        return account;
        
    } catch (error:any) {
        console.log(error);
        throw new Error(`Error sending email: ${error.message}`)
    }
}