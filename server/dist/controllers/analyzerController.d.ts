import { Request, Response } from 'express';
export declare const analyzerController: {
    runSimpleAnalysis: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    runDeepAnalysis: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    parsePdf: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getHistory: (req: Request, res: Response) => Promise<void>;
    getUsage: (req: Request, res: Response) => Promise<void>;
    getRoles: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=analyzerController.d.ts.map