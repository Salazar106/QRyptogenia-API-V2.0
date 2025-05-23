
export interface IRoles {
    id          : string
    name        : string
    description?: string
    isSystem    : boolean
    createdAt   : Date
    updatedAt  ?: Date
}