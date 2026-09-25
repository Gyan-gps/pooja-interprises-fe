import { createRepository } from "./createRepository";
import { STAFF_LIST } from "../data";
import type { StaffMember } from "../../types";

export const staffRepository = createRepository<StaffMember, number>("staff", STAFF_LIST);
