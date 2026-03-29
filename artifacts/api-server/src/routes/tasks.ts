import { Router, type IRouter } from "express";
import { db, tasksTable, taskTagsTable, tagsTable } from "@workspace/db";
import { eq, inArray, and } from "drizzle-orm";
import {
  CreateTaskBody,
  UpdateTaskBody,
  UpdateTaskParams,
  DeleteTaskParams,
  GetTaskParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getTaskWithTags(taskId: number) {
  const task = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).then(r => r[0]);
  if (!task) return null;

  const taskTagRows = await db.select().from(taskTagsTable).where(eq(taskTagsTable.taskId, taskId));
  let tags: typeof tagsTable.$inferSelect[] = [];
  if (taskTagRows.length > 0) {
    tags = await db.select().from(tagsTable).where(inArray(tagsTable.id, taskTagRows.map(r => r.tagId)));
  }
  return { ...task, tags };
}

router.get("/tasks", async (req, res) => {
  const tagIdsParam = req.query.tagIds as string | undefined;

  let taskRows = await db.select().from(tasksTable).orderBy(tasksTable.order, tasksTable.createdAt);

  const taskTagRows = await db.select().from(taskTagsTable);
  const allTags = await db.select().from(tagsTable);

  const tagMap = new Map(allTags.map(t => [t.id, t]));

  let tasks = taskRows.map(task => {
    const tagIds = taskTagRows.filter(tt => tt.taskId === task.id).map(tt => tt.tagId);
    const tags = tagIds.map(id => tagMap.get(id)).filter(Boolean) as typeof tagsTable.$inferSelect[];
    return { ...task, tags };
  });

  if (tagIdsParam) {
    const filterTagIds = tagIdsParam.split(",").map(Number).filter(n => !isNaN(n));
    if (filterTagIds.length > 0) {
      tasks = tasks.filter(task => task.tags.some(t => filterTagIds.includes(t.id)));
    }
  }

  res.json(tasks);
});

router.get("/tasks/:id", async (req, res) => {
  const { id } = GetTaskParams.parse({ id: Number(req.params.id) });
  const task = await getTaskWithTags(id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.post("/tasks", async (req, res) => {
  const body = CreateTaskBody.parse(req.body);
  const { tagIds, ...taskData } = body;

  const maxOrderResult = await db.select({ order: tasksTable.order }).from(tasksTable)
    .where(eq(tasksTable.status, taskData.status ?? "todo"))
    .orderBy(tasksTable.order);

  const maxOrder = maxOrderResult.length > 0 ? Math.max(...maxOrderResult.map(r => r.order)) + 1 : 0;

  const [task] = await db.insert(tasksTable).values({
    ...taskData,
    order: maxOrder,
  }).returning();

  if (tagIds && tagIds.length > 0) {
    await db.insert(taskTagsTable).values(tagIds.map(tagId => ({ taskId: task.id, tagId })));
  }

  const taskWithTags = await getTaskWithTags(task.id);
  res.status(201).json(taskWithTags);
});

router.patch("/tasks/:id", async (req, res) => {
  const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
  const body = UpdateTaskBody.parse(req.body);

  const existing = await db.select().from(tasksTable).where(eq(tasksTable.id, id)).then(r => r[0]);
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const { tagIds, ...taskData } = body;

  const [updated] = await db.update(tasksTable)
    .set({ ...taskData, updatedAt: new Date() })
    .where(eq(tasksTable.id, id))
    .returning();

  if (tagIds !== undefined) {
    await db.delete(taskTagsTable).where(eq(taskTagsTable.taskId, id));
    if (tagIds.length > 0) {
      await db.insert(taskTagsTable).values(tagIds.map(tagId => ({ taskId: id, tagId })));
    }
  }

  const taskWithTags = await getTaskWithTags(updated.id);
  res.json(taskWithTags);
});

router.delete("/tasks/:id", async (req, res) => {
  const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  await db.delete(taskTagsTable).where(eq(taskTagsTable.taskId, id));
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.status(204).send();
});

export default router;
