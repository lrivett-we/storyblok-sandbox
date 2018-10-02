import React from "react";

const globe = (props) => {
  const style = {
    padding: "20px",
    backgroundColor: props.colour || "black",
    textAlign: "center",
  }
  return (
    <div style={style}>
      <h3 style={{color: "white"}}>{props.caption}</h3>
      <img src="http://www.pngall.com/wp-content/uploads/2016/06/Globe-PNG-Image.png" alt="Globe" />
    </div>
  )
};

export default globe;
