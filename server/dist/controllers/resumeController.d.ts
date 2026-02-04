import { Request, Response } from 'express';
export declare const resumeController: {
    getAll: (req: Request, res: Response) => Promise<void>;
    getOne: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    delete: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    generatePdf: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    downloadPdf: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=resumeController.d.ts.map