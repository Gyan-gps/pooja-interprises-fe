import { createRepository } from "./createRepository";
import { CLIENTS } from "../data";
import type { Client } from "../../types";

export const clientsRepository = createRepository<Client, number>("clients", CLIENTS);
