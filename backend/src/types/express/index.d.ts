// src/types/express/index.d.ts
import { Role } from '../../constant/role';


declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      permissions: string[];
    }

    interface Request {
      user?: Express.User;
    }

    /**
     * Optional: Extend Response if you're using custom methods like `res.success()`
     */
    // interface Response {
    //   success(data: any, statusCode?: number): void;
    //   failure(message: string, statusCode?: number): void;
    // }
  }
}

export {}; // Ensures this file is treated as a module