import { CliError } from "./cli-error";

export class MissingFlagCliError extends CliError {
  constructor(flagName:string){
    super(`Expected ${flagName} flag`)
  }
}