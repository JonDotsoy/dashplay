import { expect, spyOn, test, Mock, mock } from "bun:test"
import { MetricStatics } from "./metric-statics"
import ms from "ms"
import { ObjFromSchema } from "../db/query"
import { EventMessage } from "../db/models"
import { monotonicFactory } from "ulid"

const ulid = monotonicFactory(() => 0)

const makeEvent = (time: number, message: string = `[message]`): EventMessage => {
  return {
    id: ulid(time),
    message: message,
    timestamp: time,
  }
}


const sampleEvents: EventMessage[] = [
  ...Array(3).fill(0).map(() => makeEvent(ms('12s'))),
  ...Array(2).fill(0).map(() => makeEvent(ms('30s'))),
  ...Array(5).fill(0).map(() => makeEvent(ms('30s'))),
  ...Array(1).fill(0).map(() => makeEvent(ms('35s'))),
  ...Array(4).fill(0).map(() => makeEvent(ms('45s'))),
  ...Array(2).fill(0).map(() => makeEvent(ms('49s'))),
  ...Array(3).fill(0).map(() => makeEvent(ms('51s'))),
  ...Array(6).fill(0).map(() => makeEvent(ms('54s'))),
  ...Array(4).fill(0).map(() => makeEvent(ms('58s'))),
  ...Array(7).fill(0).map(() => makeEvent(ms('64s'))),
  ...Array(3).fill(0).map(() => makeEvent(ms('70s'))),
  ...Array(1).fill(0).map(() => makeEvent(ms('71s'))),
  ...Array(1).fill(0).map(() => makeEvent(ms('91s'))),
]


test('should calculate date points', async () => {
  const metricStatics = new MetricStatics(
    {},
    {
      interval: '30s',
      reducer({ count = 0 }) {
        return {
          count: count + 1
        }
      }
    }
  )

  const result = await Array.fromAsync(metricStatics.calculateDataPoints(sampleEvents))
})

test('should watch last changes on result aggregate', async () => {
  const metricStatics = new MetricStatics(
    {},
    {
      interval: '1s',
      reducer({ count = 0 }) {
        return {
          count: count + 1
        }
      }
    }
  )

  const fn = mock((..._: any): any => undefined)

  await Array.fromAsync(metricStatics.calculateDataPoints(sampleEvents, { onChangePartialResultAggregate: fn }))

  expect(fn).toHaveBeenCalled()
})

test('should load a metric statics module', async () => {
  const metricStatics = await MetricStatics.load(await import("./metric-statics-modules/sample1"))

  await Array.fromAsync(metricStatics.calculateDataPoints(sampleEvents))

  expect(metricStatics).toBeInstanceOf(MetricStatics)
})
