import { flag, flags, isStringAt } from "@jondotsoy/flags";
import { AppContext } from "../../../app/app-context";
import { ConsoleRender } from "../../../common/console-render";
import { MissingFlagCliError } from "../../../errors/missing-flag-cli-error";
import { LogGroup } from "../../../logs-service/logs-group";
import { LogStream } from "../../../logs-service/logs-stream";

export default async (ctx: AppContext, args: string[]) => {
  const { logGroupName } = flags<{ logGroupName: string }>(args, {}, [
    [flag('--log-group-name'), isStringAt('logGroupName')],
  ]);

  if (!logGroupName) throw new MissingFlagCliError('--log-group-name')

  const logGroup = await LogGroup.getLogGroup(ctx, logGroupName)

  if (!logGroup) throw new Error(`Cannot found log group`)

  const logStreams = await LogStream.listLogStream(ctx, logGroup)

  new ConsoleRender(logStreams, ctx, {
    table: {
      columns: {
        'ID': o => o.id,
        'NAME': o => o.name,
      }
    }
  }).render()
}
