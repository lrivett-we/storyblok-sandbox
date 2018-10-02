import React from 'react';
import SbEditable from 'storyblok-react';
import Teaser from '../objects/Teaser/Teaser';

const TeaserBlok = (props) => (
  <SbEditable content={props.blok}>
    <Teaser headline={props.blok.headline} />
  </SbEditable>
);

export default TeaserBlok;
