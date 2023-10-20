export class PushSubscriptor {
  private fns = new Set<() => void>()
  private tickCallback: { current: null | (() => void) } = { current: null }

  private asyncFns = new Set<() => Promise<void>>()
  private tickAsyncCallback: { current: null | Promise<void> } = { current: null }

  emitAsync() {
    if (this.tickAsyncCallback.current) return
    this.tickAsyncCallback.current = this.callAsyncFns().finally(() => {
      this.tickAsyncCallback.current = null
    })
  }

  emit() {
    if (this.tickCallback.current) return
    this.tickCallback.current = () => {
      this.emitAsync()
      this.callFns()
      this.tickCallback.current = null
    }
    process.nextTick(this.tickCallback.current)
  }

  private callFns() {
    for (const fn of this.fns) {
      fn()
    }
  }

  private async callAsyncFns() {
    for (const fn of this.asyncFns) {
      await fn()
    }
  }

  subscribe(fn: () => void) {
    this.fns.add(fn)
    return () => this.fns.delete(fn)
  }

  subscribeAsync(fn: () => Promise<void>) {
    this.asyncFns.add(fn)
    return () => this.asyncFns.delete(fn)
  }

  async close() {
    this.emitAsync()
    await this.tickAsyncCallback.current
  }
}