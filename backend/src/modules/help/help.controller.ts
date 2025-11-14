// backend/src/modules/help/help.controller.ts
import { Request, Response } from "express";

export async function getHelpTopics(_req: Request, res: Response) {
  res.json({
    topics: [
      {
        id: "getting-started",
        title: "Getting Started with decostyleHrm MERN",
        
      },
      {
        id: "leave",
        title: "Managing Leave Requests",
        
      },
      {
        id: "recruitment",
        title: "Recruitment Workflow",
       
      },
    ],
  });
}
