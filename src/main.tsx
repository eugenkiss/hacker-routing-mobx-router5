import 'tslib'
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import {Component} from 'react'
import {css} from 'emotion'
import {ThemeProvider} from 'emotion-theming'
import {injectGlobal} from 'react-emotion'
import {inject, observer, Provider} from 'mobx-react'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {faChevronLeft, faSyncAlt} from '@fortawesome/fontawesome-free-solid'
import {IconDefinition} from '@fortawesome/fontawesome-common-types'
import {Box, Flex, FlexClickable} from './comps/basic'
import {Store} from './store'
import {FeedRoute, StoryRoute} from './routes'

injectGlobal`
html,body,#root {
  height: 100%; 
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  background: #eee;
  overscroll-behavior: contain;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
a {
  color: inherit; 
  text-decoration: inherit; 
}
`

const theme = {
  space: [4, 8, 16, 32, 64, 128, 256, 512],
}

class HeaderButton extends Component<{
  icon: IconDefinition
  onClick: () => void
}> {
  render() {
    const {icon, onClick} = this.props
    return (
      <FlexClickable
        onClick={onClick}
        f={4}
        align='center' justify='center'
        className={css`
        height: 100%;
        width: 48px;
      `}>
        <FontAwesome icon={icon}/>
      </FlexClickable>
    )
  }
}

@inject('store') @observer
export class Header extends Component<{
  store?: Store
}> {
  render() {
    const {store} = this.props
    return (
      <Flex align='center' className={css`
        position: relative;
        top: 0;
        background: linear-gradient(to bottom, rgb(255, 102, 0) 0%, rgb(225,100,0) 100%);
        font-size: 20px;
        align-items: center;
        color: rgba(0,0,0,0.4);
        height: 48px;
      `}>
        {store.route.name !== FeedRoute.name &&
          <HeaderButton
            icon={faChevronLeft}
            onClick={() => history.back()}
          />
        }
        <Box flex='1' align='center'>
          {store.route.name === StoryRoute.name ? (
            <Box f={2}
              className={css`
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              text-decoration: none;
              color: #fff;
              text-shadow: 0 0 1px rgba(0,0,0,0.2);
            `}>
              {store.headerTitle}
            </Box>
          ) : (
            <Box f={4} align='center'
              className={css`
              font-weight: 400;
              text-transform: uppercase;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-decoration: none;
              color: #fff;
            `}>
              {store.headerTitle}
            </Box>
          )}
        </Box>
        {store.refreshAction != null &&
          <HeaderButton
            icon={faSyncAlt}
            onClick={store.refreshAction}
          />
        }
      </Flex>
    )
  }
}

@observer
export class App extends Component {
  store = new Store()

  componentWillMount() {
    const {router} = this.store
    router.start()
  }

  renderScreen() {
    const { route, routes } = this.store
    if (route == null) return null
    return routes[route.name].comp(route.params)
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Provider store={this.store}>
          <Flex flexDirection='column' className={css`
            overflow: hidden;
            height: 100%;
            min-width: 740px;
            max-width: 900px;
            width: 85%;
            margin: auto;
            padding: 10px 0 0 0;
            @media (max-width: 750px) {
              padding: 0;
              width: auto;
              min-width: auto;
              max-width: unset;
            }
          `}>
            <Header/>
            <Box flex='1' className={css`
              position: relative;
              height: 100%;
              color: #000;
              background: #ffffff;
              overflow: hidden;
            `}>
              {this.renderScreen()}
            </Box>
          </Flex>
        </Provider>
      </ThemeProvider>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'))