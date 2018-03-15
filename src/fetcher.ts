import {fromPromise, FULFILLED, IPromiseBasedObservable, PENDING, REJECTED} from 'mobx-utils'
import {PromiseState} from 'mobx-utils/lib/from-promise'
import {action, IObservableValue, observable, when} from 'mobx'
import {failedReq, fulfilledReq, getNow} from './utils'

export function fetcher<T, I=undefined>(promiseMaker: (input: I) => Promise<T>): Fetcher<T, I>  {
  return new Fetcher<T, I>(promiseMaker) as any
}

class Fetcher<T, I=void> {
  private last: IObservableValue<T> = observable.box(null)
  private lastTimeStamp: IObservableValue<number> = observable.box(-1)
  private lastInput: I = null
  @observable private req: IPromiseBasedObservable<T> = fulfilledReq

  constructor(private promiseMaker: (input: I) => Promise<T>) {}

  private whenDisposer = () => {}

  @action private fetchInternal(
    input?: I,
    wrapper: (p: Promise<T>) => Promise<T> = x => x,
  ): IPromiseBasedObservable<T> {
    this.lastInput = input
    this.req = fromPromise(wrapper(this.promiseMaker(input)))
    this.whenDisposer()
    this.whenDisposer = when(() => this.req.state !== PENDING, action(() => {
      if (this.req.state !== FULFILLED) return
      this.last.set(this.req.value)
      this.lastTimeStamp.set(getNow())
    }))
    return this.req
  }

  fetch(input?: I): IPromiseBasedObservable<T> {
    return this.fetchInternal(input)
  }

  fetchWith(wrapper: (p: Promise<T>) => Promise<T>, input?: I): IPromiseBasedObservable<T> {
    return this.fetchInternal(input, wrapper)
  }

  @action clearCache() {
    this.last.set(null)
    this.lastTimeStamp.set(-1)
  }

  valueOrFetch(input?: I): T {
    if (this.value == null && (this.req.state !== PENDING && this.req.state !== REJECTED)) {
      this.fetch(input)
    }
    return this.value
  }

  @action cancel() {
    if (this.req.state === PENDING) this.req = failedReq
  }

  get value(): T {
    return this.last.get()
  }

  get input(): I {
    return this.lastInput
  }

  get timestamp(): number {
    return this.lastTimeStamp.get()
  }

  get state(): PromiseState {
    return this.req.state
  }
}