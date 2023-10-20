import { CliError } from "../../errors/cli-error"
import main from "./cmd/main"
import { exitCode } from "./global-stores/exit-code"

exitCode.listen((value) => process.exitCode = value)

await main(process.argv.splice(2))
  .catch(ex => {
    if (ex instanceof CliError) {
      console.error(ex.message)
      return
    }
    exitCode.set(1)
    throw ex
  })
  .finally(() => {
    // process.exit(exitCode.get())
  })
