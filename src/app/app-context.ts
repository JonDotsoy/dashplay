import { atom } from "nanostores"
import { ConnectionFactory } from "../db/connection-factory"
import { Models } from "../db/models"
import { Connection, Engine, InitConnectionOptions } from "../interfaces/connection"

type RefName = string

type Options<E extends string> = {
  storageConnection?: InitConnectionOptions<E>
}

export class AppContext<E extends string = 'sqlite'> {
  #connection?: Connection
  #models?: Models

  consoleOptions = {
    output: atom('table')
  }

  private constructor(readonly options: Options<E>) { }

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
    const subConnection = ConnectionFactory.create(`${this.connection.ref}/${refName}`, this.connection.options)
    this.#subConnections.set(refName, subConnection)
    return subConnection
  }

  private async init() {
    this.#connection = await ConnectionFactory.create('local', {
      engine: this.options.storageConnection?.engine ?? 'sqlite',
      engineOptions: this.options.storageConnection?.engineOptions ?? {},
    })
    this.#models = await Models.create(this)
    return this
  }

  async [Symbol.asyncDispose]() {
    for await (const subConnection of this.#subConnections.values()) {
      await subConnection.close()
    }

    await this.#connection?.close()
  }

  static async create<E extends string = 'sqlite'>(options: Options<E>) {
    return new AppContext(options).init()
  }
}
