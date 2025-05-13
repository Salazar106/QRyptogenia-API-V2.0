import bcrypt from "bcryptjs";

export const generateHashedPassword = async (password: string) => {
    const hashedPassword = bcrypt.hash(password, 10);
    return hashedPassword;
};