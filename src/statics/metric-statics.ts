import ms from "ms"
import { EventMessage } from "../db/models"
import { atom } from "nanostores"
import type { Accumulation, MetricStaticsModule, MetricStaticsOption, ReducerDataPoints, ResultAggregate, TimeStamp } from "./types"


export class MetricStatics {
  interval: number

  constructor(
    ctx: unknown,
    readonly options: MetricStaticsOption,
  ) {
    this.interval = typeof options.interval === 'string' ? ms(options.interval) : options.interval
  }

  getInitialAccumulation(): Accumulation {
    if (typeof this.options.initialAccumulation === 'function') {
      return this.options.initialAccumulation()
    }
    return this.options.initialAccumulation ?? {}
  }

  async *calculateDataPoints(records: AsyncIterable<EventMessage> | Iterable<EventMessage>, options?: { onChangePartialResultAggregate?: (resultAggregate: ResultAggregate, unSubscribe: () => void) => void }): AsyncGenerator<ResultAggregate> {
    const toTimeStampKey = (timestamp: number) => Math.floor(timestamp / this.interval) * this.interval

    let currentResultAggregate = atom<ResultAggregate>({
      timeStamp: NaN,
      value: this.getInitialAccumulation(),
    })

    const onChangePartialResultAggregate = options?.onChangePartialResultAggregate

    if (onChangePartialResultAggregate) {
      let unSubscribe: null | (() => void) = null
      unSubscribe = currentResultAggregate.subscribe((resultAggregate) => {
        onChangePartialResultAggregate(resultAggregate, () => unSubscribe?.())
      })
    }

    for await (const event of records) {
      let resultAggregate = currentResultAggregate.get()
      const timeStampKey = toTimeStampKey(event.timeStamp)

      if (resultAggregate.timeStamp !== timeStampKey) {
        if (!Number.isNaN(resultAggregate.timeStamp)) yield resultAggregate
        resultAggregate = {
          timeStamp: timeStampKey,
          value: this.getInitialAccumulation(),
        }
      }

      resultAggregate.value = this.options.reducer(
        resultAggregate.value,
        event,
      );

      currentResultAggregate.set(resultAggregate);
    }

    const resultAggregate = currentResultAggregate.get()
    if (!Number.isNaN(resultAggregate.timeStamp)) yield resultAggregate
  }

  static async load(moduleRef: MetricStaticsModule | Promise<MetricStaticsModule>) {
    return new MetricStatics({}, await moduleRef)
  }
}