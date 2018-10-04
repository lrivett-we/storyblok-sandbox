import React from 'react';
import SbEditable from 'storyblok-react';
import Globe from '../objects/Globe/Globe';

const GlobeBlok = (props) => (
  <SbEditable content={props.blok}>
    <Globe caption={props.blok.caption} colour={props.blok.colour} />
  </SbEditable>
);

GlobeBlok.blokSettings = {
  display_name: "Global Globe",
  is_root: true,
  is_nestable: false,
  schema: {
    colour: {
      type: "option",
      options: [
        {
          value: "#000000",
          name: "Black",
        },
        {
          value: "#00aeef",
          name: "Blue",
        },
        {
          value: "#ffde30",
          name: "Gold",
        },
      ],
      pos: 0,
    },
    caption: {
      type: "text",
      pos: 1,
    }
  },
};

export default GlobeBlok;
