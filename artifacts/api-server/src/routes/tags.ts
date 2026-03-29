import { Router, type IRouter } from "express";
import { db, tagsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateTagBody,
  DeleteTagParams,
  GetTagsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tags", async (req, res) => {
  const tags = await db.select().from(tagsTable).orderBy(tagsTable.createdAt);
  const validated = GetTagsResponse.parse(tags);
  res.json(validated);
});

router.post("/tags", async (req, res) => {
  const body = CreateTagBody.parse(req.body);
  const [tag] = await db.insert(tagsTable).values(body).returning();
  res.status(201).json(tag);
});

router.delete("/tags/:id", async (req, res) => {
  const { id } = DeleteTagParams.parse({ id: Number(req.params.id) });
  const [tag] = await db.select().from(tagsTable).where(eq(tagsTable.id, id));
  if (!tag) {
    res.status(404).json({ error: "Tag not found" });
    return;
  }
  await db.delete(tagsTable).where(eq(tagsTable.id, id));
  res.status(204).send();
});

export default router;
