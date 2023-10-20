import { SentenceTransform } from "../../interfaces/sentence-transform";
import { Schema, SchemaTypes } from "../query";
import { valueString } from "./common/serialize";

export class DefineSchemaSQliteTransform implements SentenceTransform {
  constructor(
    readonly target: string,
    readonly schema: Schema<any>,
  ) { }

  toSQL() {
    const mapSchemaTypeToSQL: Record<SchemaTypes, string> = {
      [SchemaTypes.boolean]: 'BOOLEAN',
      [SchemaTypes.number]: 'INTEGER',
      [SchemaTypes.string]: 'TEXT',
      [SchemaTypes.date]: 'DATE',
    }

    const fieldDefinitions = Object.entries(this.schema.def).map(([key, schemaType]) => {
      // const columnIndexOptions = this.schema.options?.index.includes(key) ? ` INDEX` : ``
      return `${valueString(key)} ${mapSchemaTypeToSQL[schemaType]}`
    }).join(', ');

    const sentences: string[] = [
      `CREATE TABLE IF NOT EXISTS ${valueString(this.target)} (${fieldDefinitions})`
    ]

    for (const keyToMakeIndex of this.schema.options?.indexes ?? []) {
      // sentences.push(`CREATE INDEX IF NOT EXISTS ${valueString(`${this.target}_${keyToMakeIndex}_index`)} ON ${valueString(this.target)} (${valueString(keyToMakeIndex)})`)
    }

    return sentences.join(';');
  }
}
