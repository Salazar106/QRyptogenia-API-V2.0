
import { roleServices } from "../../services";
import { Request, Response } from "express";

export const UpdateRoleController = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id;                                                      // get id from params
        const roles = await roleServices.updateRoleService(id, req.body)               // update roles from service
        return res.status(200).json({ message: `Role created successfully`, roles })   // return success message
    } catch (error:any) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error',error: error.message,});
    }
}