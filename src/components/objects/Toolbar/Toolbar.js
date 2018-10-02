import React from 'react';

const toolbar = (props) => (
  <header style={{ backgroundColor: "#f6be00" }}>
    <h1>{props.pageTitle}</h1>
    <p>{props.tagline}</p>
  </header>
);

export default toolbar;