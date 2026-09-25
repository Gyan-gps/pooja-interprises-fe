import { createRepository } from "./createRepository";
import { TASKS } from "../data";
import type { Task } from "../../types";

export const tasksRepository = createRepository<Task, number>("tasks", TASKS);
