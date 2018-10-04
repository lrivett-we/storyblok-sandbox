import React from 'react';
import SbEditable from 'storyblok-react';
import Feature from '../objects/Feature/Feature';

const FeatureBlok = (props) => (
  <SbEditable content={props.blok}>
    <Feature name={props.blok.name} />
  </SbEditable>
);

FeatureBlok.blokSettings = {
  display_name: "Feature",
  is_root: false,
  is_nestable: true,
  schema: {
    name: {
      type: "text"
    }
  }
};

export default FeatureBlok;
