import { z } from 'zod';

// This schema is used to validate the input for creating a new role
export const createRoleSchema = z.object({
    name: z.string().min(3, 'Name is required'),
    description: z.string().optional(),
    isSystem: z.boolean(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

// This schema is used to validate the input for getting a role by ID
export const updateRoleSchema = z.object({
    id: z.string().uuid('Invalid role ID format'),
    name: z.string().min(3, 'Name is required').optional(),
    description: z.string().optional(),
    isSystem: z.boolean().optional(),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

