import React from 'react';
import SbEditable from 'storyblok-react';
import GoodFeature from '../objects/GoodFeature/GoodFeature';

const GoodFeatureBlok = (props) => (
  <SbEditable content={props.blok}>
    <GoodFeature name={props.blok.name} />
  </SbEditable>
);

GoodFeatureBlok.blokSettings = {
  display_name: "Good Feature",
  is_root: false,
  is_nestable: true,
  schema: {
    name: {
      type: "text"
    }
  }
};

export default GoodFeatureBlok;
