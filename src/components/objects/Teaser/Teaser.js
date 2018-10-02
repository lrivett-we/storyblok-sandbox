import React from 'react';
import Link from 'gatsby-link';

const Teaser = (props) => (
  <div className="jumbotron jumbotron-fluid">
    <div className="container">
      <h1 className="display-4">{ props.headline }</h1>
      <p className="lead">This is a modified jumbotron that occupies the entire horizontal space of its parent.</p>
      <p className="lead">
        <Link className="btn btn-primary" to={'/blog/'}>
          Blog Posts
        </Link>
      </p>
    </div>
  </div>
);

export default Teaser;
