import { EventMessage } from "../db/models"

export type TimeStamp = number

export type Accumulation = Record<string, any>
export type ReducerDataPoints<T extends Accumulation = Accumulation> = (accumulation: T, event: EventMessage) => T
export type ResultAggregate = { timeStamp: TimeStamp, value: Accumulation }

export type MetricStaticsOption = {
  interval: number | string,
  reducer: ReducerDataPoints,
  initialAccumulation?: (() => Accumulation) | Accumulation,
}

export type MetricStaticsModule = MetricStaticsOption