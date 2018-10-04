import React from 'react';
import SbEditable from 'storyblok-react';
import Teaser from '../objects/Teaser/Teaser';

const TeaserBlok = (props) => (
  <SbEditable content={props.blok}>
    <Teaser headline={props.blok.headline} />
  </SbEditable>
);

TeaserBlok.blokSettings = {
  display_name: "Teaser",
  is_root: false,
  is_nestable: true,
  schema: {
    name: {
      type: "text",
      pos: 0,
    },
  },
};

export default TeaserBlok;
