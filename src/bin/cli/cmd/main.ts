import { command, flag, flags, isBooleanAt, isStringAt, restArgumentsAt } from "@jondotsoy/flags"
import createLogGroup from "./create-log-group"
import putLogEvents from "./put-log-events"
import createLogStream from "./create-log-stream"
// import ui from "./ui"
import { AppContext } from "../../../app/app-context"
import listLogGroup from "./list-log-group"
import listLogStream from "./list-log-stream"
import listLogEvents from "./list-log-events"

export default async (args: string[]) => {
  const parsed = flags<{
    createLogGroup: string[],
    listLogGroup: string[],
    listLogStream: string[],
    listLogEvents: string[],
    createLogStream: string[],
    putLogEvents: string[],
    ui: string[],
    help: boolean,
    output: string,
  }>(
    args,
    {},
    [
      [command('create-log-group'), restArgumentsAt('createLogGroup')],
      [command('list-log-group'), restArgumentsAt('listLogGroup')],
      [command('list-log-stream'), restArgumentsAt('listLogStream')],
      [command('list-log-events'), restArgumentsAt('listLogEvents')],
      [command('create-log-stream'), restArgumentsAt('createLogStream')],
      [command('put-log-events'), restArgumentsAt('putLogEvents')],
      [command('ui'), restArgumentsAt('ui')],
      [flag('--help', '-h'), isBooleanAt('help')],
      [flag('--output', '-o'), isStringAt('output')],
    ],
  )

  const ctx = await AppContext.create({})
  try {
    ctx.consoleOptions.output.set(parsed.output ?? 'table')

    if (parsed.listLogGroup) return await listLogGroup(ctx, parsed.listLogGroup)
    if (parsed.listLogStream) return await listLogStream(ctx, parsed.listLogStream)
    if (parsed.listLogEvents) return await listLogEvents(ctx, parsed.listLogEvents)
    if (parsed.createLogGroup) return await createLogGroup(ctx, parsed.createLogGroup)
    if (parsed.createLogStream) return await createLogStream(ctx, parsed.createLogStream)
    if (parsed.putLogEvents) return await putLogEvents(ctx, parsed.putLogEvents)

    console.log('help')
  } finally {
    await ctx[Symbol.asyncDispose]()
  }
}