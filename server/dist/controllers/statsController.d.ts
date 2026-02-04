import { Request, Response } from 'express';
export declare const statsController: {
    getOverview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getResumeStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAnalysisStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getRecentActivity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserList(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=statsController.d.ts.map