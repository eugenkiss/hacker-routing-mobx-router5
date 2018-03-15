import {runInAction} from 'mobx'
import createRouter, {Plugin, PluginFactory, Router, State} from 'router5'
import browserPlugin from 'router5/plugins/browser'
import {Routes} from './routes'
import {Store} from './store'

function makeMobxRouterPlugin(routes: Routes, store: Store): PluginFactory {
  function mobxRouterPlugin(): Plugin {
    return {
      onTransitionSuccess(nextState?: State, prevState?: State) {
        const prevParams = (prevState || {} as any).params || {}
        const nextParams = nextState.params || {}
        const prevRoute = routes[(prevState || {} as any).name]
        const nextRoute = routes[nextState.name]

        if (prevRoute != null && prevRoute.deactivate != null) {
          prevRoute.deactivate(store, prevParams, nextState)
        }

        runInAction(() => {
          store.route = nextState
          nextRoute.activate(store, nextParams, (prevState || {} as any))
        })
      },
    }
  }
  (mobxRouterPlugin as any as PluginFactory).pluginName = "MOBX_PLUGIN"
  return mobxRouterPlugin as any as PluginFactory
}

export function makeMobxRouter(routes: Routes, store: Store): Router {
  const router = createRouter(Object.values(routes))
  router.usePlugin(
    browserPlugin(),
    makeMobxRouterPlugin(routes, store),
  )
  return router
}
