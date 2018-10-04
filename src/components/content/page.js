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

Page.blokSettings = {
  display_name: "Page",
  is_root: true,
  is_nestable: false,
  schema: {
    body: {
      type: "bloks"
    }
  }
};

export default Page