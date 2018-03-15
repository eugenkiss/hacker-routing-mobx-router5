import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {PENDING, REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {faBriefcase, faComments} from '@fortawesome/fontawesome-free-solid'
import {FeedRoute, StoryRoute} from '../routes'
import {A, Box, Fill, Flex, FlexClickable, Space, Span} from './basic'
import {Link} from './link'
import {FeedItem, FeedType} from '../models'
import {Store} from '../store'

@inject('store')
class TabEntry extends React.Component<{
  store?: Store
  active: boolean
  title: string
  onClick: () => void
}> {
  render() {
    const { active, title, onClick } = this.props
    return (
      <FlexClickable
        onClick={onClick}
        flex='1'
        justify='center'
        className={css`
        position: relative;
        height: 100%;
      `}>
        <Flex
          mx={1} f={2}
          justify='center'
          align='center'
          className={css`
        `}>
          {title}
        </Flex>
        <Box
          className={css`
          opacity: ${active ? '1' : '0'};
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
        `}/>
      </FlexClickable>
    )
  }
}

@inject('store') @observer
export class Tabbar extends Component<{
  store?: Store
}> {
  static ID = 'tabbar'

  handleFeedType = (type?: FeedType) => () => {
    this.props.store.navigate(FeedRoute.link(type), {replace: true})
  }

  render() {
    const selected = this.props.store.selectedFeedType
    return (
      <Flex id={Tabbar.ID} align='center' className={css`
        top: 0;
        background: rgb(210,100,0);
        font-size: 20px;
        align-items: center;
        color: white;
        height: 42px;
      `}>
        <TabEntry
          title='Hot'
          active={selected == null || selected === FeedType.Top}
          onClick={this.handleFeedType()}
        />
        <TabEntry
          title='New'
          active={selected === FeedType.New}
          onClick={this.handleFeedType(FeedType.New)}
        />
        <TabEntry
          title='Show'
          active={selected === FeedType.Show}
          onClick={this.handleFeedType(FeedType.Show)}
        />
        <TabEntry
          title='Ask'
          active={selected === FeedType.Ask}
          onClick={this.handleFeedType(FeedType.Ask)}
        />
        <TabEntry
          title='Jobs'
          active={selected === FeedType.Job}
          onClick={this.handleFeedType(FeedType.Job)}
        />
      </Flex>
    )
  }
}

@inject('store') @observer
export class FeedItemComp extends Component<{
  store?: Store
  item: FeedItem
  readOnly?: boolean
}> {
  static makeDomFeedItemId = (id: number) => `feed-item-${id}`

  handleContainerClick = (e) => {
    if (!this.props.readOnly) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    e.preventDefault()
  }

  render() {
    const { item } = this.props
    return (
      <Flex
        id={FeedItemComp.makeDomFeedItemId(item.id)}
        flex='1 1 auto'
        p={1} py={1}
        onClickCapture={this.handleContainerClick}
        className={css`
      `}>
        <Box pr={1}>
          <A
            href={item.url}
            title={item.title}
            className={css`
            font-weight: 600;
          `}>
            <Box f={2}>
              {item.title}
            </Box>
          </A>
          <Flex mt={1} f={0} align='center' color='#999'>
            {item.points != null && `${item.points} points`}
            {item.points != null && item.domain != null && <Span><Space/>|<Space/></Span>}
            {item.domain != null && item.domain}
          </Flex>
        </Box>
        <Fill pr={1}/>
        <Link
          f={1} p={1} m={-1} py={1} my={-1}
          color='#999'
          link={StoryRoute.link(item.id)}
          title={`HN: ${item.title}`}
          className={css`
          width: 48px;
          border-left: 1px solid #eee;
          background: rgba(0,0,0,.01);
          display: flex;
          flex: 0 0 auto;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}>
          {item.type !== FeedType.Job ? ([
            <FontAwesome key={1} icon={faComments} size='lg'/>
              ,
            <Span key={2} mt={'0.2rem'}>{item.commentsCount != null ? item.commentsCount : '…'}</Span>
          ]) : (
            <FontAwesome key={1} icon={faBriefcase} size='lg'/>
          )}

        </Link>
      </Flex>
    )
  }
}

const skeletonFeedItems = []
const skeletonAskFeedItems = []
const skeletonJobFeedItems = []
for (let i = 0; i < 30; i++) {
  const item = new FeedItem()
  item.id = i
  item.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  item.domain = '………'
  skeletonFeedItems.push(item)
  const askItem = new FeedItem()
  askItem.id = i
  askItem.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  askItem.type = 'ask'
  skeletonAskFeedItems.push(askItem)
  const jobItem = new FeedItem()
  jobItem.id = i
  jobItem.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  jobItem.domain = '………'
  jobItem.type = 'job'
  skeletonJobFeedItems.push(jobItem)
}

@inject('store') @observer
export class FeedScreen extends Component<{
  store?: Store
  type?: FeedType
}> {
  renderBody() {
    const {store, type} = this.props
    if (store.getFeed.value == null) {
      switch (store.getFeed.state) {
        case REJECTED: return <div>Failed to load stories!</div>
        default:
          const items = type === FeedType.Ask
            ? skeletonAskFeedItems
            : type === FeedType.Job
              ? skeletonJobFeedItems
              : skeletonFeedItems
          return items.map(story =>
          <FeedItemComp key={story.id} item={story} readOnly={true}/>
        )
      }
    } else {
      return (
        <Box>
          {store.getFeed.value.map(item =>
            <FeedItemComp key={item.id} item={item}/>
          )}
        </Box>
      )
    }
  }

  render() {
    const {store} = this.props
    return (
        <Box
          className={css`
          position: relative;
          overflow: auto;
          height: 100%;
          ${(store.getFeedManualRefreshRequest.state === PENDING || store.getFeed.value == null)
            && 'overflow: hidden'};
        `}>
          <Tabbar/>
          <Box
            className={css`
            transition: opacity 0.15s ease-in-out;
            ${store.getFeedManualRefreshRequest.state === PENDING || store.getFeed.value == null ? (
              'transition: opacity 0.05s; opacity: 0.25'
            ) : (
              'transition: opacity 0.2s ease-in-out; opacity: 1'
            )};
          `}>
            {this.renderBody()}
          </Box>
        </Box>
    )
  }
}
