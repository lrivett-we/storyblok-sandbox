import React from "react";

const globe = (props) => {
  const style = {
    pad: props.padding,
    backgroundColor: props.colour,
  }
  return (
    <div>
      <img src="http://www.pngall.com/wp-content/uploads/2016/06/Globe-PNG-Image.png" alt="Globe" />
    </div>
  )
};

export default globe;
