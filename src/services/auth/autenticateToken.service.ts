import { db } from "../../config";


export const authenticateTokenService = async (body:any) => {

    try {
         const userget = await db.users.findUnique({
                    where: { id_user: body.id },
                    select: {
                        id_user: true,
                        name: true,
                        email: true,
                        
        
                    }
                });
        
                if (!userget) {
                    throw new Error( 'User not Found' );
                }
        
                const user = {
                    id_user: userget.id_user,
                    name: userget.name,
                    email: userget.email,
                }
                return user;
    } catch (error: any) {
        throw new Error(error.message || 'Unknown error')
    }
}