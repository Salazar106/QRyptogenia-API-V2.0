import { db } from '../../config'
import bcrypt from 'bcryptjs'
import { generateJWT } from '../../utils'


export const login = async (email: string, password: string) => {
    try {
        const user = await db.users.findFirst({
            where: { email },
            include: {
                credentials: true,
            },
        })

        if (!user) {
            throw new Error(`User with email ${email} not found`)
        }

        if (user?.is_verified === false) {
            throw new Error('User not verified')
        }

        if (!user.credentials || user.credentials.length === 0) {
            throw new Error(`Credentials for user with email ${email} not found`)
        }

        const passwordValidation = await bcrypt.compare(password, user.credentials[0].password)

        if (!passwordValidation) throw new Error('Wrong password')

        const token = await generateJWT({ id: user.id_user })

        return {
            // message: 'User logged in successfully',
                id: user.id_user,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                accessToken: token,
        }
    } catch (error: any) {
        throw new Error(error.message || 'Unknown error')
    }
}
