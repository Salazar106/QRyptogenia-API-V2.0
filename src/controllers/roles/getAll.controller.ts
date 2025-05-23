import { roleServices } from "../../services";
import { Request, Response } from "express";

export const GetAllRolesController = async (_req: Request, res: Response): Promise<any> => {
    try {
        const roles = await roleServices.GetAllRolesService()                               // get roles from service
        if (!roles) {return res.status(404).json({ message: 'Roles don`t found' })}         // validation to finded roles
        return res.status(200).json({ message: `Roles retrieved successfully`, roles })     // return success message
    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
    }
}