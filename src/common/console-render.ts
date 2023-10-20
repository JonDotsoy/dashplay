import { AppContext } from "../app/app-context";

type sel<T> = (obj: T) => string

enum OutputTypes {
  table,
  json,
  jsonl,
}

const mapOutputTypes: Record<string, OutputTypes | undefined> = {
  'table': OutputTypes.table,
  'json': OutputTypes.json,
  'jsonl': OutputTypes.jsonl,
}

type Options<T> = {
  table: {
    columns: Record<string, sel<T>>
  }
}

export class ConsoleRender<T = any> {
  output: OutputTypes;

  constructor(readonly obj: T | T[], readonly ctx: AppContext, readonly options: Options<T>) {
    this.output = mapOutputTypes[ctx.consoleOptions.output.get()] ?? OutputTypes.table
  }

  private renderTable() {
    const obj = this.obj
    const rows: string[][] = []

    const { headers, selectors } = Object.entries(this.options.table.columns).reduce(({ headers, selectors }, [key, value]) => ({ headers: [...headers, key], selectors: [...selectors, value] }), { headers: [] as string[], selectors: [] as sel<T>[] })

    rows.push(headers)

    const rowSizing: number[] = headers.map(header => header.length)

    if (Array.isArray(obj)) {
      for (const o of obj) {
        rows.push(
          selectors.map((sel, index) => {
            const value = sel(o)
            const sizing = rowSizing.at(index) ?? 0
            rowSizing[index] = value.length > sizing ? value.length : sizing
            return value
          })
        )
      }
    }

    for (const row of rows) {
      console.log(row.map((cel, index) => cel.padEnd(rowSizing.at(index) ?? 0, ' ')).join('  '))
    }
  }

  private renderJSONL() {
    const obj = this.obj
    if (Array.isArray(obj)) {
      for (const elm of obj) {
        console.log(JSON.stringify(elm))
      }
      return
    }
    console.log(JSON.stringify(obj))
  }

  render() {
    const obj = this.obj
    if (this.output === OutputTypes.json) return console.log(JSON.stringify(obj, null, 2))
    if (this.output === OutputTypes.jsonl) return this.renderJSONL()
    return this.renderTable()
  }

}