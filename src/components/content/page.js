import React from 'react'
import Components from '../components.js';
import ToolbarBlok from '../global/toolbar';

const Page = (props) => {
  return (
    <div>
      <ToolbarBlok blok={props.global.toolbar} />
      {props.blok.body && props.blok.body.map((blok) => React.createElement(Components[blok.component], {key: blok._uid, blok: blok, global: props.global}))}
    </div>
  )
}

export default Page