// src/database/schemaHelpers.js
// Utilidades idempotentes para migraciones. En MySQL/MariaDB el DDL no es
// transaccional, por eso cada paso comprueba el estado actual antes de actuar:
// así una migración interrumpida puede reintentarse sin romper nada.
// Compatibles con MySQL 8 y MariaDB 10.4+ (XAMPP).
import { QueryTypes } from "sequelize";

const select = (qi, sql, replacements = {}) =>
  qi.sequelize.query(sql, { type: QueryTypes.SELECT, replacements });

export const tableExists = async (qi, table) => {
  const rows = await select(
    qi,
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
    { table }
  );
  return rows.length > 0;
};

export const getColumn = async (qi, table, column) => {
  const [row] = await select(
    qi,
    `SELECT COLUMN_NAME AS name, DATA_TYPE AS dataType, IS_NULLABLE AS nullable
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    { table, column }
  );
  return row || null;
};

/** Agrega la columna solo si no existe. */
export const ensureColumn = async (qi, table, column, definition) => {
  if (await getColumn(qi, table, column)) return false;
  await qi.addColumn(table, column, definition);
  console.log(`  + ${table}.${column}`);
  return true;
};

/**
 * Garantiza que exista exactamente una FK sobre `table.column` hacia
 * `refTable.id` con la regla ON DELETE indicada. Elimina FKs duplicadas o con
 * regla distinta (herencia de `sync({ alter: true })` y del bd.sql original).
 */
export const ensureForeignKey = async (qi, { table, column, refTable, onDelete }) => {
  const existing = await select(
    qi,
    `SELECT k.CONSTRAINT_NAME AS name, r.DELETE_RULE AS deleteRule
     FROM information_schema.KEY_COLUMN_USAGE k
     JOIN information_schema.REFERENTIAL_CONSTRAINTS r
       ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
     WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME = :table
       AND k.COLUMN_NAME = :column AND k.REFERENCED_TABLE_NAME IS NOT NULL`,
    { table, column }
  );

  const expectedRule = onDelete.toUpperCase();
  if (existing.length === 1 && existing[0].deleteRule === expectedRule) return false;

  for (const fk of existing) {
    await qi.removeConstraint(table, fk.name);
    console.log(`  - FK ${table}.${fk.name} (${fk.deleteRule})`);
  }

  const name = `fk_${table}_${column}`;
  await qi.addConstraint(table, {
    type: "foreign key",
    name,
    fields: [column],
    references: { table: refTable, field: "id" },
    onDelete: expectedRule,
    onUpdate: "CASCADE",
  });
  console.log(`  + FK ${name} -> ${refTable}.id ON DELETE ${expectedRule}`);
  return true;
};

/** Índices únicos de la tabla agrupados por nombre, con sus columnas en orden. */
const getUniqueIndexes = async (qi, table) => {
  const rows = await select(
    qi,
    `SELECT INDEX_NAME AS name, COLUMN_NAME AS col
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table
       AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'
     ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
    { table }
  );
  const byName = new Map();
  for (const { name, col } of rows) {
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(col);
  }
  return byName;
};

/**
 * Garantiza un único índice UNIQUE sobre `columns`. Si hay duplicados (p. ej.
 * phone, phone_2, phone_3 creados por `sync({ alter: true })`) conserva uno y
 * borra el resto. Si los datos actuales violan la unicidad, aborta con un
 * mensaje que indica qué registros corregir en lugar de dejar el esquema a medias.
 */
export const ensureUniqueIndex = async (qi, table, columns, name) => {
  const key = columns.join(",");
  const matching = [...(await getUniqueIndexes(qi, table))]
    .filter(([, cols]) => cols.join(",") === key)
    .map(([indexName]) => indexName);

  if (matching.length === 0) {
    const colList = columns.map((c) => `\`${c}\``).join(", ");
    const duplicates = await select(
      qi,
      `SELECT ${colList}, COUNT(*) AS total FROM \`${table}\`
       GROUP BY ${colList} HAVING COUNT(*) > 1 LIMIT 20`
    );
    if (duplicates.length > 0) {
      throw new Error(
        `No se puede crear UNIQUE(${key}) en ${table}: hay registros duplicados. ` +
          `Corrígelos y vuelve a ejecutar la migración:\n${JSON.stringify(duplicates, null, 2)}`
      );
    }
    await qi.addIndex(table, columns, { name, unique: true });
    console.log(`  + UNIQUE ${table}(${key})`);
    return;
  }

  for (const redundant of matching.slice(1)) {
    await qi.removeIndex(table, redundant);
    console.log(`  - índice duplicado ${table}.${redundant}`);
  }
};
