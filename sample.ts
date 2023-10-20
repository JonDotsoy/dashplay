import ms from "ms";
import { GroupingStrategy, LogStream } from "./src/logs/logs-stream";

const logGroup = await LogStream.select(`/my-app/http-service`, GroupingStrategy.everyMinute)

const tick = { current: 0 }

await logGroup.sendMessageOne(`Tick ${tick.current++}`)
setInterval(
  async () => {
    await logGroup.sendMessageOne(`Tick ${tick.current++}`)
    console.log(`Tick ${tick.current}`)
  },
  ms('20s')
)
