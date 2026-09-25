import { createRepository } from "./createRepository";
import { INITIAL_ORDERS } from "../data";
import type { Order } from "../../types";

export const ordersRepository = createRepository<Order, string>("orders", INITIAL_ORDERS);
