import { setupServer } from "msw/node";
import { handlers as troiHandlers } from "./troiHandlers";
import { handlers as nocodbHandlers } from "./nocodbHandlers";
import { handlers as personioHandlers } from "./personioHandlers";

export const server = setupServer(
  ...troiHandlers,
  ...nocodbHandlers,
  ...personioHandlers,
);
