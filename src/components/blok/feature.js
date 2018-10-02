import React from 'react';
import SbEditable from 'storyblok-react';
import Feature from '../objects/Feature/Feature';

const FeatureBlok = (props) => (
  <SbEditable content={props.blok}>
    <Feature name={props.blok.name} />
  </SbEditable>
);

export default FeatureBlok;
