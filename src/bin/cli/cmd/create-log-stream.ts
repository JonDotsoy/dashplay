import { flag, flags, isStringAt } from "@jondotsoy/flags";
import { MissingFlagCliError } from "../../../errors/missing-flag-cli-error";
import { LogGroup } from "../../../logs-service/logs-group";
import { AppContext } from "../../../app/app-context";
import { LogStream } from "../../../logs-service/logs-stream";

export default async (ctx: AppContext, args: string[]) => {
  const { logGroupName, logStreamName } = flags<{ logGroupName: string, logStreamName: string }>(args, {}, [
    [flag('--log-group-name'), isStringAt('logGroupName')],
    [flag('--log-stream-name'), isStringAt('logStreamName')],
  ]);

  if (!logGroupName) throw new MissingFlagCliError('--log-group-name')
  if (!logStreamName) throw new MissingFlagCliError('--log-stream-name')

  const logGroup = await LogGroup.getLogGroup(ctx, logGroupName)

  if (!logGroup) throw new Error(`Cannot found log group`)

  await LogStream.createLogStream(ctx, logGroup, logStreamName)
}