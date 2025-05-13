import { z } from 'zod';

export const registerUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone_number: z.string().min(10, 'Phone number must have at least 10 digits'),
    state_id: z.boolean().optional(),
    password: z.string()
        .min(6, 'Password must have at least 6 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
