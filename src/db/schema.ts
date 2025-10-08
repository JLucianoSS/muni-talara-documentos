import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, varchar, pgEnum, unique, foreignKey } from 'drizzle-orm/pg-core';

// Enum para estados de expediente
export const stateEnum = pgEnum('state', ['en_tramite', 'cerrado', 'pendiente']);


// Tabla de Usuarios (para login demo)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),  // Hash con bcrypt en código
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla de Áreas (carpetas virtuales)
export const areas = pgTable('areas', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

// Tabla de Expedientes
export const expedientes = pgTable('expedientes', {
  id: serial('id').primaryKey(),
  number: varchar('number', { length: 50 }).notNull().unique(),
  state: stateEnum('state').default('en_tramite').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  responsibleUserId: serial('responsible_user_id').notNull().references(() => users.id),
  areaId: serial('area_id').notNull().references(() => areas.id),
});

// Tabla de Documentos
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  expedienteId: serial('expediente_id').notNull().references(() => expedientes.id),
  name: varchar('name', { length: 200 }).notNull(), // Nombre del documento para identificarlo
  date: timestamp('date').notNull(),
  responsibleUserId: serial('responsible_user_id').notNull().references(() => users.id),
  areaId: serial('area_id').notNull().references(() => areas.id),
  filePath: text('file_path').notNull(),  // Ruta del archivo subido, e.g., '/uploads/doc-123.pdf'
});

// Relaciones (para queries relacionales en Drizzle)
export const usersRelations = relations(users, ({ many }) => ({
  expedientes: many(expedientes),
  documents: many(documents),
}));

export const areasRelations = relations(areas, ({ many }) => ({
  expedientes: many(expedientes),
  documents: many(documents),
}));

export const expedientesRelations = relations(expedientes, ({ one, many }) => ({
  responsibleUser: one(users, {
    fields: [expedientes.responsibleUserId],
    references: [users.id],
  }),
  area: one(areas, {
    fields: [expedientes.areaId],
    references: [areas.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  expediente: one(expedientes, {
    fields: [documents.expedienteId],
    references: [expedientes.id],
  }),
  responsibleUser: one(users, {
    fields: [documents.responsibleUserId],
    references: [users.id],
  }),
  area: one(areas, {
    fields: [documents.areaId],
    references: [areas.id],
  }),
}));