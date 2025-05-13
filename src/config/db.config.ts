import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
export const connectDB = async () => {
  try {
    await db.$connect();
    console.log(`Successfully connected to the MySql database`);

  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  } 
};