import { atom } from "nanostores"
import { ConnectionFactory } from "../db/connection-factory"
import { Models } from "../db/models"
import { Connection } from "../interfaces/connection"

type RefName = string

type Options = {

}

export class AppContext {
  #connection?: Connection
  #models?: Models

  consoleOptions = {
    output: atom('table')
  }

  private constructor() { }

  get models() {
    if (!this.#models) throw new Error(`models is not ready yet`)
    return this.#models
  }

  get connection() {
    if (!this.#connection) throw new Error(`Connection is not ready yet`)
    return this.#connection
  }

  #subConnections = new Map<RefName, Promise<Connection>>()

  async getSubConnection(refName: RefName): Promise<Connection> {
    const currentSubConnection = this.#subConnections.get(refName)
    if (currentSubConnection) return currentSubConnection
    const subConnection = ConnectionFactory.create(`${this.connection.getRef()}/${refName}`)
    this.#subConnections.set(refName, subConnection)
    return subConnection
  }

  private async init(options: Options) {
    this.#connection = await ConnectionFactory.create('local')
    this.#models = await Models.create(this)
    return this
  }

  async [Symbol.asyncDispose]() {
    for await (const subConnection of this.#subConnections.values()) {
      await subConnection.close()
    }

    await this.#connection?.close()
  }

  static async create(options: Options) {
    return new AppContext().init(options)
  }
}
