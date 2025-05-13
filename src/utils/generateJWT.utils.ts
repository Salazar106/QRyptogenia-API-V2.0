import jwt from "jsonwebtoken";
import { envs } from "../config";

const secretKey = envs.JWT_SECRET;

export const generateJWT = (payload: any, expiresIn: number = 7200) => {
    return new Promise<string>((resolve, reject) => {

        if (!secretKey) {
            reject(
                new Error("The environment variable JWT_SECRET is not defined")
            );
            return;
        }

        jwt.sign(
            payload,
            secretKey,
            {
                expiresIn,
            },
            (error, token) => {
                if (error) {
                    console.error("No token: " + error);
                    reject("No token: " + error);
                    return;
                }

                if (!token) {
                    reject(new Error("Undefind token"));
                    return;
                }

                resolve(token);
            }
        );
    });
};

export const decodeJWT = (token: string) => {
    return new Promise<any>((resolve, reject) => {

        if (!secretKey) {
            reject(new Error("The environment variable JWT_SECRET is not defined"));
            return;
        }

        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                console.error("Token verification failed: " + error);
                reject("Token verification failed: " + error);
                return;
            }

            if (!decoded) {
                reject(new Error("Token could not be decoded"));
                return;
            }

            resolve(decoded);
        });
    });
};