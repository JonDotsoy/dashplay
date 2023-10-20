import { expect, test } from "bun:test";
import {
  Query,
  Schema,
  SchemaTypes,
  query,
  mutate,
} from "./query";
import { QuerySQLiteTransform } from "./query-transforms/query-sqlite-transform";
import { MutateSQLiteTransform } from "./query-transforms/mutate-sqlite-transform";

const schema = Schema.createSchema({
  name: SchemaTypes.string,
  age: SchemaTypes.number,
});

test("should generate a basic SELECT query", () => {
  const q = query<typeof schema>("users");

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users"');
});

test("should generate a SELECT query with specific columns", () => {
  const q = query<typeof schema>("users").fields("name", "age");

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT "name", "age" FROM "users"');
});

test("should generate a SELECT query with a WHERE condition", () => {
  const q = query<typeof schema>("users")
    .fields("name", "age")
    .where((a) =>
      a
        .equalTo("name", "Juan")
    );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT "name", "age" FROM "users" WHERE "name" = "Juan"');
});

test("should generate a SELECT query with a WHERE condition for a specific column", () => {
  const q = query<typeof schema>("users").where((q) =>
    q.equalTo("name", "Juan")
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "name" = "Juan"');
});

test("should generate a SELECT query with a WHERE condition for an integer column", () => {
  const q = query<typeof schema>("users").where((q) =>
    q.equalTo("age", 23)
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" = 23');
});

test("should generate a SELECT query with a WHERE condition for inequality", () => {
  const q = query<typeof schema>("users").where((q) =>
    q
      .notEqualTo("age", 30)
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" != 30');
});

test("should generate a SELECT query with a WHERE condition for less than", () => {
  const q = query<typeof schema>("users").where((q) =>
    q
      .lessThan("age", 30)
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" < 30');
});

test("should generate a SELECT query with a WHERE condition for greater than", () => {
  const q = query<typeof schema>("users").where(q => q.
    greaterThan("age", 30),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" > 30');
});

test("should generate a SELECT query with a WHERE condition for less than or equal to", () => {
  const q = query<typeof schema>("users").where(q => q.
    lessThanOrEqualTo("age", 30),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" <= 30');
});

test("should generate a SELECT query with a WHERE condition for greater than or equal to", () => {
  const q = query<typeof schema>("users").where(q => q.
    greaterThanOrEqualTo("age", 30),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" >= 30');
});

test("should generate a SELECT query with a WHERE condition using LIKE", () => {
  const q = query<typeof schema>("users").where(q => q.
    like("age", "3"),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" LIKE "3"');
});

test("should generate a SELECT query with a WHERE condition for a range of values", () => {
  const q = query<typeof schema>("users").where(q => q.
    between("age", 20, 30),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" BETWEEN 20 AND 30');
});

test("should generate a SELECT query with a WHERE condition for an IN clause", () => {
  const q = query<typeof schema>("users").where(q => q.
    in("age", [20, 30]),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE "age" IN (20, 30)');
});

test(`should generate a SELECT query with multiple 'AND' conditions`, () => {
  const q = query<typeof schema>("users").where(q => q.
    and(
      q => q.equalTo('name', 'Luis'),
      q => q.equalTo('age', 3),
    ),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE ("name" = "Luis" AND "age" = 3)');
});

test(`should generate a SELECT query with multiple 'OR' conditions`, () => {
  const q = query<typeof schema>("users").where(q => q.
    or(
      q => q.equalTo('name', 'Luis'),
      q => q.equalTo('age', 3),
    ),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE ("name" = "Luis" OR "age" = 3)');
});

test(`should generate a SELECT query with a complex 'OR' and 'AND' condition`, () => {
  const q = query<typeof schema>("users").where(q => q.
    or(
      q => q.equalTo('name', "Luis"),
      q => q.and(
        q => q.greaterThan('age', 10),
        q => q.lessThan('age', 30),
      )
    ),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE ("name" = "Luis" OR ("age" > 10 AND "age" < 30))');
});


test(`should generate a SELECT query with a 'NOT' condition`, () => {
  const q = query<typeof schema>("users").where(q => q.
    not(
      q => q.equalTo('name', 'Luis')
    ),
  );

  expect(
    new QuerySQLiteTransform(q).toSQL(),
  ).toEqual('SELECT * FROM "users" WHERE NOT "name" = "Luis"');
});


test('should generate an INSERT query with multiple sets', () => {
  const q = mutate<typeof schema>("users").set({ name: 'Luis' }, { age: 30 })

  expect(
    new MutateSQLiteTransform(q).toSQL(),
  ).toEqual('INSERT INTO "users" ("name", "age") VALUES ("Luis", null), (null, 30)');
})

test(`should generate a DELETE query with a 'WHERE' condition`, () => {
  const q = mutate<typeof schema>("users").delete(q => q.equalTo('name', 'Luis'))

  expect(
    new MutateSQLiteTransform(q).toSQL(),
  ).toEqual('DELETE FROM "users" WHERE "name" = "Luis"');
})

test(`should generate an UPDATE query with 'SET' and 'WHERE' conditions`, () => {
  const q = mutate<typeof schema>("users").set({ "age": 30 }).where(q => q.equalTo('name', 'Luis'))

  expect(
    new MutateSQLiteTransform(q).toSQL(),
  ).toEqual('UPDATE "users" SET "age" = 30 WHERE "name" = "Luis"');
})
