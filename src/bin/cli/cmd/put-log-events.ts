import { flags, flag, isStringAt, isBooleanAt } from "@jondotsoy/flags"
import { MissingFlagCliError } from "../../../errors/missing-flag-cli-error";
import { LogGroup } from "../../../logs/logs-group";
import { createInterface } from "readline"
import { PushSubscriptor } from "../../../common/push-subscriptor";
import { ulid } from "ulid";
import { EventMessage } from "../../../db/models";
import { AppContext } from "../../../app/app-context";
import { LogStream } from "../../../logs/logs-stream";

export default async (ctx: AppContext, args: string[]) => {
  const { logGroupName, logStreamName, eventMessage, eventStream, offPrintEvents = false } = flags<{ logGroupName: string, logStreamName: string, eventMessage: string, eventStream: boolean, offPrintEvents: boolean }>(args, {}, [
    [flag('--log-group-name'), isStringAt('logGroupName')],
    [flag('--log-stream-name'), isStringAt('logStreamName')],
    [flag('--event-message'), isStringAt('eventMessage')],
    [flag('--event-stream'), isBooleanAt('eventStream')],
    [flag('--off-print-events'), isBooleanAt('offPrintEvents')],
  ]);

  if (!logGroupName) throw new MissingFlagCliError('--log-group-name')
  if (!logStreamName) throw new MissingFlagCliError('--log-stream-name')

  const logGroup = await LogGroup.getLogGroup(ctx, logGroupName)

  if (!logGroup) throw new Error(`Cannot found log group`)

  const logStream = await LogStream.getLogStream(ctx, logGroup, logStreamName)

  if (!logStream) throw new Error(`Cannot found log stream`)

  if (eventMessage) {
    return await logStream.sendMessageOne(`${eventMessage}`)
  }
  if (eventStream) {
    const pushSubscriptor = new PushSubscriptor()
    let linesToPush: EventMessage[] = []

    if (offPrintEvents === false) {
      process.stdin.addListener('data', data => {
        process.stdout.write(data)
      })
    }

    const rl = createInterface({
      input: process.stdin,
    })

    rl.addListener('line', line => {
      linesToPush.push({ id: ulid(), message: line, timestamp: Date.now() })
      pushSubscriptor.emit()
    })

    pushSubscriptor.subscribeAsync(async () => {
      const lines = [...linesToPush]
      await logStream.sendEvents(lines)
      linesToPush = []
    })

    await new Promise(r => rl.addListener('close', r))
    await pushSubscriptor.close()
  }

  throw new MissingFlagCliError(`--event-message or --event-stream`)
}