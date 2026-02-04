import { Request, Response } from 'express';
export declare const authController: {
    googleAuth: (req: Request, res: Response) => Promise<void>;
    googleCallback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    logout: (req: Request, res: Response) => Promise<void>;
    getMe: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export declare const seedAdminUser: () => Promise<void>;
//# sourceMappingURL=authController.d.ts.map