import { roleServices } from "../../services";
import { Request, Response } from "express";

export const CreateRoleController = async (req: Request, res: Response): Promise<any> => {
    try {
        const roles = await roleServices.CreateRoleService(req.body)                     // get roles from service
        return res.status(200).json({ message: `Role created successfully`, roles })     // return success message
    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
    }
}