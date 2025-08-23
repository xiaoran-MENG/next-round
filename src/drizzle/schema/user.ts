import { pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"
import { JobInfoTable } from "./jobInfo"
import { relations } from "drizzle-orm"

export const UserTable = pgTable("users", {
  id: varchar().primaryKey(), // Clerk uses string for ID
  email: varchar().notNull().unique(),
  name: varchar().notNull(),
  imageUrl: varchar().notNull(),
  createdAt,
  updatedAt,
})

export const userRelations = relations(UserTable, ({ many }) => ({
  jobInfos: many(JobInfoTable)
}))