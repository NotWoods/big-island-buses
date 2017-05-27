import * as React from 'react';

/**
 * A header to show the name of a stop
 */
const StopName: React.SFC<object> = props => {
  return (
    <div className="title stop-title">
      <h2 className="name stop-name">{props.children}</h2>
    </div>
  );
};

export default StopName;
