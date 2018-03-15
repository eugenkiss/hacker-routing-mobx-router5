import * as React from 'react'
import {action, when} from 'mobx'
import {Params, Route, State} from 'router5/create-router'
import {Store} from './store'
import {FeedScreen} from './comps/feed'
import {skeletonStory, StoryScreen} from './comps/story'
import {FeedType} from './models'
import {minDuration} from './utils'

export type LinkData = {name: string, params?: object}

export interface HNRoute extends Route {
  link: (...args: any[]) => LinkData
  comp: (next?: Params) => any
  activate?: (store: Store, current?: Params, prev?: State) => void
  deactivate?: (store: Store, current?: Params, next?: State) => void
}

export type Routes = {[name: string]: HNRoute}

export const routes: Routes = {}


export const FeedRoute: HNRoute = {
  name: 'feed',
  path: '/?:type',

  // Reverse routing 💪
  link: (type?: FeedType) => ({
    name: FeedRoute.name,
    params: { type: type }
  }),

  comp: ({ type }) => <FeedScreen type={type}/>,

  activate: action((store: Store) => {
    store.headerTitle = 'HN'

    if (store.getFeed.value == null) {
      store.getFeed.fetch()
    }

    store.refreshAction = async () => {
      store.getFeed.clearCache()
      store.getFeedManualRefreshRequest = store.getFeed.fetchWith(minDuration(500))
      await store.getFeedManualRefreshRequest
    }
  }),

  deactivate: (store: Store) => {
    store.refreshAction = null
  },
}
routes[FeedRoute.name] = FeedRoute


const storyDisposers: {[id: number]: () => void} = {}

export const StoryRoute: HNRoute = {
  name: 'story',
  path: '/story/:id',

  link: (id) => ({
    name: StoryRoute.name, params: {id: id}
  }),

  comp: ({id}) => <StoryScreen id={id}/>,

  activate: action((store: Store, {id}) => {
    window.scrollTo(null, 0)

    store.refreshAction = () => store.getStory.fetch(id)

    if (id !== store.getStory.input) store.getStory.clearCache()
    store.getStory.fetchWith(minDuration(250), id)

    store.headerTitle = skeletonStory.title
    storyDisposers[id] = when(() => store.getStory.value != null, () => {
      store.headerTitle = store.getStory.value.title
    })
  }),

  deactivate: (store: Store) => {
    for (const disposer of Object.values(storyDisposers)) disposer()
    store.refreshAction = null
    store.getStory.cancel()
  },
}
routes[StoryRoute.name] = StoryRoute
