import React from 'react';
import SbEditable from 'storyblok-react';
import Toolbar from '../objects/Toolbar/Toolbar';

const ToolbarBlok = (props) => (
  <SbEditable content={props.blok}>
    <Toolbar pageTitle={props.blok.pageTitle} tagline={props.blok.tagline} />
  </SbEditable>
);

ToolbarBlok.blokSettings = {
  display_name: "Global Toolbar",
  is_root: true,
  is_nestable: false,
  schema: {
    pageTitle: {
      type: "text",
      pos: 0,
    },
    tagline: {
      type: "text",
      pos: 1,
    },
  },
};

export default ToolbarBlok;
