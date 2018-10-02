import React from 'react';
import Components from '../components/components.js';

class StoryblokEntry extends React.Component {
  static getDerivedStateFromProps(props, state) {
    if (state.story.uuid === props.pageContext.story.uuid) {
      return null;
    }

    return StoryblokEntry.prepareStory(props);
  }

  static prepareStory(props) {
    const story = Object.assign({}, props.pageContext.story);
    story.content = JSON.parse(story.content);
    
    const globalNodes = props.pathContext.globalNodes;
    let global = {};
    for (var slug in globalNodes) {
      global[slug] = JSON.parse(globalNodes[slug].content);
    }
    
    return { story, global };
  }

  constructor(props) {
    super(props);

    this.state = StoryblokEntry.prepareStory(props);
  }

  render() {
    let content = this.state.story.content;
    let global = this.state.global;

    return (
      <div>
        {React.createElement(Components[content.component], {global, key: content._uid, blok: content})}
      </div>
    )
  }
}

export default StoryblokEntry;
