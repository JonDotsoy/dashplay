export enum SchemaTypes {
  string,
  number,
  boolean,
  /** @deprecated */
  date,
}

export type TransformValue<T> = T extends SchemaTypes.string ? string
  : T extends SchemaTypes.number ? number
  : T extends SchemaTypes.boolean ? boolean
  : T extends SchemaTypes.date ? Date
  : never;

export type TransformSchemaTypes<T> = T extends Record<string, SchemaTypes>
  ? { [k in keyof T]: TransformValue<T[k]> }
  : never;

export type ObjFromSchema<T> = T extends Schema<infer R>
  ? R
  : never;

export interface SchemaOptions<T = any> {
  indexes: KeysOfSchema<T>[]
}

export class Schema<T = any> {
  constructor(readonly def: Record<string, SchemaTypes>, readonly options?: SchemaOptions<T>) { }

  static createSchema<T extends Record<string, SchemaTypes>>(
    def: T,
    options?: SchemaOptions
  ) {
    return new Schema<TransformSchemaTypes<T>>(def, options);
  }
}

export type SchemaToType<T> = T extends Schema<infer R> ? R : any

type KeysOfSchema<T> = T extends Schema<infer O> ? keyof O : any;
type TypesOfSchemaByKey<T, K> = T extends Schema<infer O>
  ? O extends Record<any, any> ? O[K] : any
  : any;

type PartialObjectBySchema<T> = T extends Schema<infer O> ? Partial<O> : any;

export class Assertion { }

export class EqualTo<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly value: TypesOfSchemaByKey<S, T>) {
    super();
  }
}

export class NotEqualTo<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly value: TypesOfSchemaByKey<S, T>) {
    super();
  }
}

export class LessThan<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly value: TypesOfSchemaByKey<S, T>) {
    super();
  }
}

export class GreaterThan<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly value: TypesOfSchemaByKey<S, T>) {
    super();
  }
}

export class LessThanOrEqualTo<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly value: TypesOfSchemaByKey<S, T>) {
    super();
  }
}

export class GreaterThanOrEqualTo<S, T extends KeysOfSchema<S>>
  extends Assertion {
  constructor(readonly field: T, readonly value: TypesOfSchemaByKey<S, T>) {
    super();
  }
}

export class Like<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly value: string) {
    super();
  }
}

export class Between<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(
    readonly field: T,
    readonly valueLeft: TypesOfSchemaByKey<S, T>,
    readonly valueRight: TypesOfSchemaByKey<S, T>,
  ) {
    super();
  }
}

export class In<S, T extends KeysOfSchema<S>> extends Assertion {
  constructor(readonly field: T, readonly values: TypesOfSchemaByKey<S, T>[]) {
    super();
  }
}

export class And<S> extends Assertion {
  constructor(readonly assertions: Assertion[]) {
    super();
  }
}

export class Or<S> extends Assertion {
  constructor(readonly assertions: Assertion[]) {
    super();
  }
}

export class Not<S> extends Assertion {
  constructor(readonly andAssertion: And<S>) {
    super();
  }
}

export class Where<S = any> {
  constructor(private query: { addAssertion: (assertion: Assertion) => any }) { }

  equalTo<T extends KeysOfSchema<S>>(
    field: T,
    value: TypesOfSchemaByKey<S, T>,
  ) {
    this.query.addAssertion(new EqualTo(field, value));
    return this;
  }

  notEqualTo<T extends KeysOfSchema<S>>(
    field: T,
    value: TypesOfSchemaByKey<S, T>,
  ) {
    this.query.addAssertion(new NotEqualTo(field, value));
    return this;
  }

  lessThan<T extends KeysOfSchema<S>>(
    field: T,
    value: TypesOfSchemaByKey<S, T>,
  ) {
    this.query.addAssertion(new LessThan(field, value));
    return this;
  }


  greaterThan<T extends KeysOfSchema<S>>(field: T, value: TypesOfSchemaByKey<S, T>) {
    this.query.addAssertion(new GreaterThan<S, T>(field, value))
    return this
  }

  lessThanOrEqualTo<T extends KeysOfSchema<S>>(field: T, value: TypesOfSchemaByKey<S, T>) {
    this.query.addAssertion(new LessThanOrEqualTo<S, T>(field, value))
    return this
  }

  greaterThanOrEqualTo<T extends KeysOfSchema<S>>
    (field: T, value: TypesOfSchemaByKey<S, T>) {
    this.query.addAssertion(new GreaterThanOrEqualTo<S, T>(field, value))
    return this
  }

  like<T extends KeysOfSchema<S>>(field: T, value: string) {
    this.query.addAssertion(new Like<S, T>(field, value))
    return this
  }

  between<T extends KeysOfSchema<S>>(
    field: T,
    valueLeft: TypesOfSchemaByKey<S, T>,
    valueRight: TypesOfSchemaByKey<S, T>,
  ) {
    this.query.addAssertion(new Between<S, T>(field, valueLeft, valueRight))
    return this
  }

  in<T extends KeysOfSchema<S>>(field: T, values: TypesOfSchemaByKey<S, T>[]) {
    this.query.addAssertion(new In<S, T>(field, values))
    return this
  }

  and(...cbs: ((where: Where<S>) => void)[]) {
    const assertions: Assertion[] = []
    for (const cb of cbs) {
      cb(new Where({ addAssertion: assertion => assertions.push(assertion) }))
    }
    this.query.addAssertion(new And<S>(assertions))
    return this
  }

  or(...cbs: ((where: Where<S>) => void)[]) {
    const assertions: Assertion[] = []
    for (const cb of cbs) {
      cb(new Where({ addAssertion: assertion => assertions.push(assertion) }))
    }
    this.query.addAssertion(new Or<S>(assertions))
    return this
  }

  not(cb: (where: Where<S>) => void) {
    const assertions: Assertion[] = []
    cb(new Where({ addAssertion: assertion => assertions.push(assertion) }))
    this.query.addAssertion(new Not<S>(
      new And<S>(assertions)
    ))
    return this
  }
}

export class Query<S = any> {
  constructor(
    readonly target: string,
    readonly columnsSet = new Set<KeysOfSchema<S>>(),
    readonly assertionRef: { current?: And<S> } = {},
    readonly setValues = new Set<unknown[]>(),
  ) { }

  fields(...columns: KeysOfSchema<S>[]) {
    for (const column of columns) this.columnsSet.add(column);
    return this;
  }

  set(...values: PartialObjectBySchema<S>[]) {
    this.setValues.add(values);
    return this;
  }

  addAssertion(assertion: Assertion) {
    this.assertionRef.current = this.assertionRef.current ?? new And([])
    this.assertionRef.current.assertions.push(assertion);
    return this;
  }

  where(cb: (where: Where<S>) => void) {
    cb(new Where(this));
    return this;
  }
}

export enum MutateType {
  SET,
  DELETE
}

export class Mutate<S = any> {
  constructor(
    readonly target: string,
    readonly columnsSet = new Set<KeysOfSchema<S>>(),
    readonly assertionRef: { current?: And<S> } = {},
    readonly setValues = new Set<PartialObjectBySchema<S>>(),
    private type: MutateType | null = null
  ) { }

  set(...values: PartialObjectBySchema<S>[]) {
    for (const value of values) {
      for (const key of Object.keys(value)) this.columnsSet.add(key as KeysOfSchema<S>)
      this.setValues.add(value);
    }
    return this;
  }

  addAssertion(assertion: Assertion) {
    this.assertionRef.current = this.assertionRef.current ?? new And([])
    this.assertionRef.current.assertions.push(assertion);
    return this;
  }

  delete(cb: (where: Where<S>) => void) {
    cb(new Where(this));
    return this;
  }

  where(cb: (where: Where<S>) => void) {
    cb(new Where(this));
    return this;
  }
}

export const query = <S = any>(targetName: string) => new Query<S>(targetName)
export const mutate = <S = any>(targetName: string) => new Mutate<S>(targetName)
