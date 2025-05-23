import { db } from "../../config"
import { IRoles } from "../../interfaces"

export const CreateRoleService = async (data:IRoles) => {
    try {

        // Validar que el rol no exista
        const existingRole = await db.role.findFirst({ where: { name: data.name } });
        if (existingRole) throw new Error(`Role with name ${data.name} already exists.`); //validate name uniqueness
        
        // Crear el rol en la base de datos
        const response = await db.role.create({
            data:{...data}
        })
        
        return response
    } catch (error:any) {
        console.log(error);
        throw new Error(error.message);  // Lanzamos el error con un mensaje detallado
    } 
}
