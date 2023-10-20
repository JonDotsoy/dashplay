import { inspect } from "util";
import { SentenceTransform as SentenceTransform } from "../../interfaces/sentence-transform";
import { And, Assertion, Between, EqualTo, GreaterThan, GreaterThanOrEqualTo, In, LessThan, LessThanOrEqualTo, Like, Not, NotEqualTo, Or, Query } from "../query";
import { valueString, valueUnknown } from "./common/serialize";

export class QuerySQLiteTransform implements SentenceTransform {
  constructor(readonly query: Query) {
  }

  toSQL(): string {
    const columns = Array.from(this.query.columnsSet.values()).map((e) =>
      valueString(`${e}`)
    );

    const columnsSentence = columns.length ? columns.join(", ") : "*";

    const whereSql = !!this.query.assertionRef.current
      ? ` WHERE ${QuerySQLiteTransform.assertionToSQL(this.query.assertionRef.current)}`
      : ``;

    return `SELECT ${columnsSentence} FROM ${valueString(this.query.target)
      }${whereSql}`;
  }

  static assertionToSQL(assertion: Assertion): string {
    const wrapping = (wrap: boolean, s: string) => wrap ? `(${s})` : s

    if (assertion instanceof EqualTo) {
      return `${valueString(assertion.field)} = ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof NotEqualTo) {
      return `${valueString(assertion.field)} != ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof LessThan) {
      return `${valueString(assertion.field)} < ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof GreaterThan) {
      return `${valueString(assertion.field)} > ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof LessThanOrEqualTo) {
      return `${valueString(assertion.field)} <= ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof GreaterThanOrEqualTo) {
      return `${valueString(assertion.field)} >= ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof Like) {
      return `${valueString(assertion.field)} LIKE ${valueUnknown(assertion.value)
        }`;
    }
    if (assertion instanceof Between) {
      return `${valueString(assertion.field)} BETWEEN ${valueUnknown(assertion.valueLeft)
        } AND ${valueUnknown(assertion.valueRight)}`;
    }
    if (assertion instanceof In) {
      return `${valueString(assertion.field)} IN ${wrapping(true, assertion.values.map(valueUnknown).join(', '))}`;
    }
    if (assertion instanceof And) {
      return wrapping(assertion.assertions.length > 1, assertion.assertions.map(assertion => this.assertionToSQL(assertion)).join(' AND '))
    }
    if (assertion instanceof Or) {
      return wrapping(assertion.assertions.length > 1, assertion.assertions.map(assertion => this.assertionToSQL(assertion)).join(' OR '))
    }
    if (assertion instanceof Not) {
      return `NOT ${this.assertionToSQL(assertion.andAssertion)}`
    }
    throw new TypeError(
      `Assertion cannot transform assertion to sql`,
    );
  }
}
