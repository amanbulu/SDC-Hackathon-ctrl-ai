import { Router, type IRouter } from "express";
import { catalog, evaluate } from "@workspace/skill-model";
import { GetSkillCatalogResponse, EvaluateProfileBody, EvaluateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();
router.get("/skillhalflife/catalog", (_req,res) => {
  res.json(GetSkillCatalogResponse.parse(catalog));
});
router.post("/skillhalflife/evaluate", (req,res) => {
  res.set("Cache-Control", "no-store, private");
  const parsed=EvaluateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({error:"Invalid evaluation input",details:parsed.error.flatten()});
    return;
  }
  try {
    res.json(EvaluateProfileResponse.parse(evaluate(parsed.data)));
  } catch (error) {
    if (error instanceof Error && error.name!=="ZodError") {
      res.status(400).json({error:error.message});
      return;
    }
    throw error;
  }
});
export default router;
