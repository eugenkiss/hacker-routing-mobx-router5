import {computed, observable} from 'mobx'
import {DoneFn, NavigationOptions} from 'router5'
import {makeMobxRouter} from './router'
import {FeedRoute, LinkData, routes} from './routes'
import {fulfilledReq} from './utils'
import {fetcher} from './req'
import {ApiClient} from './api-client'
import {FeedItem, FeedType, Story} from './models'

export class Store {
  api = new ApiClient('https://hnpwa.com/api/v0')

  routes = routes
  router = makeMobxRouter(this.routes, this)
  @observable route = null

  @observable headerTitle: string = null

  @observable refreshAction = null

  private lastSelectedFeedType = null
  @computed get selectedFeedType() {
    if (this.route.name != FeedRoute.name) {
      return this.lastSelectedFeedType
    }
    return this.lastSelectedFeedType = this.route.params.type
  }

  @observable getFeedManualRefreshRequest = fulfilledReq

  private feedFetcher = (type: FeedType) => fetcher<Array<FeedItem>>(() =>
    this.api.getFeedItems(type)
  )

  private getHotFeed = this.feedFetcher(FeedType.Top)
  private getNewFeed = this.feedFetcher(FeedType.New)
  private getShowFeed = this.feedFetcher(FeedType.Show)
  private getAskFeed = this.feedFetcher(FeedType.Ask)
  private getJobsFeed = this.feedFetcher(FeedType.Job)

  @computed get getFeed() {
    switch (this.selectedFeedType) {
      case FeedType.New: return this.getNewFeed
      case FeedType.Show: return this.getShowFeed
      case FeedType.Ask: return this.getAskFeed
      case FeedType.Job: return this.getJobsFeed
      case FeedType.Top: return this.getHotFeed
      default: return this.getHotFeed
    }
  }

  getStory = fetcher<Story, number>((id: number) =>
    this.api.getItem(id)
  )

  navigate = (linkData: LinkData, options?: NavigationOptions, done?: DoneFn) => {
    const {name, params} = linkData
    this.router.navigate(name, params, options, done)
  }
}
