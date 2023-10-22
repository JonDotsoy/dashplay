/// <reference no-default-lib="true"/>
import { ReducerDataPoints, TimeStamp } from "../types"

export const interval = '50s'

export const reducer: ReducerDataPoints = ({ count = 0 }, { id }) => {
  return { count: count + 1 }
}
