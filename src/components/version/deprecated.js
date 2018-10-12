import React from "react";
import Components from '../components.js';

/**
 * args:
 *  display_name: the name of the deprecated component
 *  is_root: true if the component is a content type, false otherwise
 *  replacements: an array of components that should be used to replace the deprecated one
 *  date: the date at which this component will be automatically deleted from all stories
 */

const deprecated = (args) => {
  let message = "This component type is no longer supported.";
  let suggestion = "Please remove it from all content.";
  let warning = "All occurrences will soon be automatically removed.";

  if (args.display_name) {
    message = `Component type ${args.display_name} is no longer supported.`;
  }
  else if (args.is_root) {
    message = `The content type of this story is no longer supported.`;
  }

  if (args.replacements && args.replacements instanceof Array) {
    if (args.replacements.length === 1) {
      suggestion = `Please use ${args.replacements[0]} instead.`;
    }
    else {
      suggestion = `Please use one of the following alternatives: ${args.replacements.join(", ")}.`;
    }
  }

  if (args.date) {
    warning = `All occurrences will be automatically removed on ${args.date}.`;
  }

  const style = {
    color: "magenta",
    backgroundColor: "black",
  }

  let DeprecatedComponent = null;

  if (args.is_root) {
    DeprecatedComponent = (props) => {
      return <div>
        <header style={style}>
          <h1>DEPRECATED</h1>
          <p>{message}</p>
          <p>{suggestion}</p>
          <p>{warning}</p>
        </header>
        {props.blok.body && props.blok.body.map((blok) => React.createElement(Components[blok.component], {key: blok._uid, blok: blok, global: props.global}))}
      </div>
    }
  }
  else {
    DeprecatedComponent = () => {
      return <div style={style}>
        <h1>DEPRECATED</h1>
        <p>{message}</p>
        <p>{suggestion}</p>
        <p>{warning}</p>
      </div>;
    };
  }

  DeprecatedComponent.deprecated = true;
  return DeprecatedComponent;   
};

export default deprecated;