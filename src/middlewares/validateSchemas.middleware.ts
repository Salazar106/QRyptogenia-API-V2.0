import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body); // Valida y transforma los datos
            next(); // Pasa al siguiente middleware/controlador
        } catch (error) {
            if (error instanceof ZodError) {
                // Personalizar los errores
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'), // Ruta del campo con el error
                    message: err.message, // Mensaje del error
                    code: err.code, // Código del error
                }));

                // Otra vista del formateo y personalización del mensaje de error
                // const formattedErrors = error.flatten().fieldErrors;
                // Resultado: { password: ["Required"], email: ["Invalid email"] }

                

                res.status(400).json({
                    message: 'Validation error',
                    errors: formattedErrors, // Enviar los errores personalizados
                });
            }

            // Si el error no es de Zod, pasar al middleware de error
            next(error);
        }
    };
