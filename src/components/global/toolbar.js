import React from 'react';
import SbEditable from 'storyblok-react';
import Toolbar from '../objects/Toolbar/Toolbar';

const ToolbarBlok = (props) => (
  <SbEditable content={props.blok}>
    <Toolbar pageTitle={props.blok.pageTitle} tagline={props.blok.tagline} />
  </SbEditable>
);

export default ToolbarBlok;
