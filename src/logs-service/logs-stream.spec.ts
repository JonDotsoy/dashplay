import { expect, test } from "bun:test";
import { AppContext } from "../app/app-context";
import { LogGroup } from "./logs-group";
import { LogStream } from "./logs-stream";
import { mkdir, rm } from "fs/promises"
import { monotonicFactory } from "ulid";

test('should update manifest when is inserted a message', async () => {
  const sandboxLocation = new URL(`__sandbox__/1/`, import.meta.url)
  await rm(sandboxLocation, { recursive: true })
  await mkdir(sandboxLocation, { recursive: true })

  const ctx = await AppContext.create({
    storageConnection: {
      engine: 'sqlite' as const,
      engineOptions: {
        basePathLocation: sandboxLocation
      }
    }
  })

  try { await LogGroup.createLogGroup(ctx, 'demo_log_group') } catch { }
  const logGroup = (await LogGroup.getLogGroup(ctx, 'demo_log_group'))!
  try { await LogStream.createLogStream(ctx, logGroup!, 'demo_log_stream') } catch { }
  const logStream = (await LogStream.getLogStream(ctx, logGroup!, 'demo_log_stream'))!

  const ulid = monotonicFactory(() => 0)

  await logStream.insertEventMessageOne('message', ulid(10), 10)
  await logStream.insertEventMessages([
    ...Array(10).fill(0).map((_, i) => ({ id: ulid(100000 + i), message: 'message', timeStamp: 100000 + i })),
    ...Array(10).fill(0).map((_, i) => ({ id: ulid(9100000 + i), message: 'message', timeStamp: 9100000 + i })),
  ])

  expect(logStream.logStreamManifest.value?.timestampFrom).toStrictEqual(10)
  expect(logStream.logStreamManifest.value?.timestampTo).toStrictEqual(9100009)
})
