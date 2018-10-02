import React from 'react'
import Components from '../components.js';
import Toolbar from '../global/toolbar';

const Page = (props) => {
  return (
    <div>
      <Toolbar blok={props.global.toolbar} />
      {props.blok.body && props.blok.body.map((blok) => React.createElement(Components[blok.component], {key: blok._uid, blok: blok, global: props.global}))}
    </div>
  )
}

export default Page