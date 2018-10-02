import React from 'react';
import SbEditable from 'storyblok-react';
import Globe from '../objects/Globe/Globe';

const GlobePlaceableBlok = (props) => {
  const globe = props.global.globe;
  if (!globe) return null;
  return (
    <SbEditable content={globe}>
      <Globe caption={globe.caption} colour={globe.colour} />
    </SbEditable>
  )
};

export default GlobePlaceableBlok;
