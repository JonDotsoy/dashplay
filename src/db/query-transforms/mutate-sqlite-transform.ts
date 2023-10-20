import { SentenceTransform } from "../../interfaces/sentence-transform";
import { Mutate } from "../query";
import { QuerySQLiteTransform } from "./query-sqlite-transform"

const valueString = (value: string) => JSON.stringify(value);
const valueUnknown = (value: unknown) => JSON.stringify(value);

export class MutateSQLiteTransform implements SentenceTransform {
  constructor(readonly mutate: Mutate) {
  }

  toSQL(): string {
    const fields = Array.from(this.mutate.columnsSet.values());
    const columns = fields.map((e) =>
      valueString(`${e}`)
    );

    const columnsSentence = columns.length ? ` (${columns.join(", ")})` : "";

    if (this.mutate.assertionRef.current) {
      if (this.mutate.setValues.size) {
        const sets = Object.assign({}, ...Array.from(this.mutate.setValues));
        const setSentence = Object.entries(sets).map(([key, value]) => `${valueString(key)} = ${valueUnknown(value)}`).join(', ')
        return `UPDATE ${valueString(this.mutate.target)} SET ${setSentence} WHERE ${QuerySQLiteTransform.assertionToSQL(this.mutate.assertionRef.current)}`
      }

      return `DELETE FROM ${valueString(this.mutate.target)} WHERE ${QuerySQLiteTransform.assertionToSQL(this.mutate.assertionRef.current)}`
    }

    if (this.mutate.setValues.size) {
      const valuesSentence = Array.from(this.mutate.setValues).map(value =>
        `(${fields.map(fieldName => valueUnknown(value[fieldName] ?? null)).join(', ')})`
      ).join(', ');

      return `INSERT INTO ${valueString(this.mutate.target)}${columnsSentence} VALUES ${valuesSentence}`;
    }

    throw new Error(`The set or delete function is expected to be used`)
  }

}
