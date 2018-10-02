import React from 'react';
import Components from '../components.js';
import Grid from '../objects/Grid/Grid.js';
import SbEditable from 'storyblok-react';

const GridBlok = (props) => (
  <SbEditable content={props.blok}>
    <Grid>
      {props.blok.columns.map((blok) =>
        React.createElement(Components[blok.component], {key: blok._uid, blok: blok, global: props.global})
      )}
    </Grid>
  </SbEditable>
);

export default GridBlok;
