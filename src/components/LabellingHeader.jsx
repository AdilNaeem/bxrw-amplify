import React from 'react';

const LabellingHeader = (props) => {

  return (
    <div className="header-info">
        <span>{props.props.date}</span><br />
        <span>{props.props.location}</span><br />
        <span>Round {props.props.round}</span><br />
    </div>
  )
};

export default LabellingHeader;