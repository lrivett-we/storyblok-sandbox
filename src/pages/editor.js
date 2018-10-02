import React from 'react';
import Components from '../components/components.js';
import SbEditable from 'storyblok-react';
import config from '../../gatsby-config';

const loadStoryblokBridge = function(cb) {
  let sbConfigs = config.plugins.filter((item) => {
    return item.resolve === 'gatsby-source-storyblok'
  })
  let sbConfig = sbConfigs.length > 0 ? sbConfigs[0] : {}
  let script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = `//app.storyblok.com/f/storyblok-latest.js?t=${sbConfig.options.accessToken}`
  script.onload = cb
  document.getElementsByTagName('head')[0].appendChild(script)
}

const getParam = function(val) {
  var result = ''
  var tmp = []

  window.location.search
    .substr(1)
    .split('&')
    .forEach(function (item) {
      tmp = item.split('=')
      if (tmp[0] === val) {
        result = decodeURIComponent(tmp[1])
      }
    })

  return result
}

class StoryblokEntry extends React.Component {
  constructor(props) {
    super(props)
    this.state = {global: {}, story: null}
  }

  componentDidMount() {
    loadStoryblokBridge(() => { this.initStoryblokEvents() })
  }

  loadGlobalData(story) {
    // TODO - modify this to query multiple nodes
    window.storyblok.get({
      slug: "___global/toolbar",
      version: "draft",
    }, (toolbar) => {
      window.storyblok.get({
        slug: "___global/globe",
        version: "draft",
      }, (globe) => {
        const global = {toolbar: toolbar.story.content, globe: globe.story.content};
        this.setState({story, global});
      });
    });
  }

  loadStory(payload) {
    window.storyblok.get({
      slug: payload.storyId, 
      version: 'draft',
    }, (data) => {
      this.loadGlobalData(data.story);
    })
  }

  initStoryblokEvents() {
    this.loadStory({storyId: getParam('path')})

    let sb = window.storyblok

    sb.on(['change', 'published'], (payload) => {
      this.loadStory(payload)
    })

    sb.on('input', (payload) => {
      if (this.state.story && payload.story.id === this.state.story.id) {
        this.setState({story: payload.story})
      }
    })

    sb.pingEditor(() => {
      if (sb.inEditor) {
        sb.enterEditmode()
      }
    })
  }

  render() {
    if (this.state.story == null) {
      return (<div></div>)
    }

    let content = this.state.story.content;
    let global = this.state.global;

    return (
      <SbEditable content={content}>
        <div>
          {React.createElement(Components[content.component], {global, key: content._uid, blok: content})}
        </div>
      </SbEditable>
    )
  }
}

export default StoryblokEntry
