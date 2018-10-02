import React from 'react';
import SbEditable from 'storyblok-react';
import Globe from '../objects/Globe/Globe';

const GlobeBlok = (props) => (
  <SbEditable content={props.blok}>
    <Globe caption={props.blok.caption} colour={props.blok.colour} />
  </SbEditable>
);

export default GlobeBlok;
