import { flag, flags, isStringAt } from "@jondotsoy/flags"
import { AppContext } from "../../../app/app-context"
import serve from '../../../ui/serve'

export default async (ctx: AppContext, args: string[]) => {
  const options = flags(args, { port: 3000, host: 'localhost' }, [
    [flag('--host', '-h'), isStringAt('host')],
    [flag('--port', '-p'), isStringAt('port')],
  ])

  await serve(ctx)
}
