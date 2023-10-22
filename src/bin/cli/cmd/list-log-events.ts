import { flags, flag, isStringAt } from "@jondotsoy/flags"
import { LogStream } from "../../../logs/logs-stream"
import { AppContext } from "../../../app/app-context"
import { MissingFlagCliError } from "../../../errors/missing-flag-cli-error";
import { LogGroup } from "../../../logs/logs-group";
import { ConsoleRender } from "../../../common/console-render";
import { ObjFromSchema } from "../../../db/query";
import { type MessageSchema } from "../../../db/models"

export default async (ctx: AppContext, args: string[]) => {
  const { logGroupName, logStreamName, match } = flags<{ logGroupName: string, logStreamName: string, match: string }>(args, {}, [
    [flag('--log-group-name'), isStringAt('logGroupName')],
    [flag('--log-stream-name'), isStringAt('logStreamName')],
    [flag('--match'), isStringAt('match')],
  ]);

  if (!logGroupName) throw new MissingFlagCliError('--log-group-name')
  if (!logStreamName) throw new MissingFlagCliError('--log-stream-name')

  const testRegExp = match ? new RegExp(match) : null
  const test = (message: string): boolean => testRegExp?.test(message) ?? true

  const logGroup = await LogGroup.getLogGroup(ctx, logGroupName)

  if (!logGroup) throw new Error(`Cannot found log group`)

  const logStream = await LogStream.getLogStream(ctx, logGroup, logStreamName)

  if (!logStream) throw new Error(`Cannot found log stream`)

  const filter = <T extends { message: string }>(d: T[]) => d.filter(d => test(d.message))

  new ConsoleRender<ObjFromSchema<typeof MessageSchema>>(
    filter(await logStream.listEventMessages()),
    ctx,
    {
      table: {
        columns: {
          TIMESTAMP: o => new Date(o.timestamp).toLocaleString(),
          MESSAGE: o => o.message,
        }
      }
    },
  ).render()
}
