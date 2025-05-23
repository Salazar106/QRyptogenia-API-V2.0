import { db } from "../../config";
import { IRoles } from "../../interfaces";


export const updateRoleService = async (id: string, data: Partial<IRoles>) => {
    try {
        const role = await db.role.findUnique({ where: { id } });
        if (!role) throw new Error(`Role with id ${id} not found.`);

        const updatedRole = await db.role.update({
            where: { id },
            data
        });

        return {
            message: "Role updated successfully",
            data: updatedRole,
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
}