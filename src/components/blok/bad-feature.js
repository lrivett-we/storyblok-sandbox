import React from 'react';
import SbEditable from 'storyblok-react';
import BadFeature from '../objects/BadFeature/BadFeature';

const BadFeatureBlok = (props) => (
  <SbEditable content={props.blok}>
    <BadFeature name={props.blok.name} />
  </SbEditable>
);

BadFeatureBlok.blokSettings = {
  display_name: "Bad Feature",
  is_root: false,
  is_nestable: true,
  schema: {
    name: {
      type: "text"
    }
  }
};

export default BadFeatureBlok;
