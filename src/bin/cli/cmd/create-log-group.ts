import { flag, flags, isStringAt } from "@jondotsoy/flags"
import { LogGroup } from "../../../logs/logs-group"
import { MissingFlagCliError } from "../../../errors/missing-flag-cli-error";
import { AppContext } from "../../../app/app-context";

export default async (ctx: AppContext, args: string[]) => {
  const { logGroupName } = flags<{ logGroupName: string }>(args, {}, [
    [flag('--log-group-name'), isStringAt('logGroupName')],
  ]);

  if (!logGroupName) throw new MissingFlagCliError('--log-group-name')

  await LogGroup.createLogGroup(ctx, logGroupName)
}
