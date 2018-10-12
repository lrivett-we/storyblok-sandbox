import React from 'react'
import Components from '../components.js';
import ToolbarBlok from '../global/toolbar.js';

const WeirdPage = (props) => {
  return (
    <div>
      <ToolbarBlok blok={props.global.toolbar} />
      <div style={{width: "80%", margin: "0% 10% 0% 10%", border: "5px solid pink"}}>
        {props.blok.body && props.blok.body.map((blok) => React.createElement(Components[blok.component], {key: blok._uid, blok: blok, global: props.global}))}
      </div>
    </div>
  )
}

WeirdPage.blokSettings = {
  display_name: "Weird Page",
  is_root: true,
  is_nestable: false,
  schema: {
    body: {
      type: "bloks"
    }
  }
};

export default WeirdPage