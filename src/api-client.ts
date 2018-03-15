import {deserialize} from 'serializr'
import {FeedItem, FeedType, Item} from './models'

export class ApiClient {

  constructor(private baseUrl: string) {}

  private get = (url) => fetch(this.baseUrl + url, {
    method: 'GET',
  }).then(res => res.json())

  getItem = async (id: number): Promise<Item> => {
    return deserialize(Item, await this.get(`/item/${id}.json`))
  }

  getFeedItems = async (type: FeedType, page?: number): Promise<Array<FeedItem>> => {
    const t = type === FeedType.Job ? 'jobs' : type
    return deserialize(FeedItem, await this.get(`/${t}.json?page=${page}`) as any[])
  }
}
