import React, { useState } from 'react';
import './EntryField.css';

export const EntryField = ( {fieldName, fieldValues, selectedValue, updateSelectedValue, fieldMapper} ) => {
  
  let numValues = fieldValues.length;

  const handleClick = (value) => {
    updateSelectedValue(value);
  };

  const innerDivs = fieldValues.map((value, index) => {
    let resolved = fieldMapper ? fieldMapper[value] : value;
    return (<div 
      key={`entry-field-${fieldName}-${index}`}
      className={`grid-item ${selectedValue === resolved ? 'entry-field-selected' : ''}`} 
      onClick={() => handleClick(value)}>
      <p>{value.toUpperCase()}</p>
  </div>)
  });

  return (
    <>
    <div className='entry-field-label'>
        <p>{fieldName.toUpperCase()}:</p>
    </div>
    <div className={`grid-container${numValues}`}>
      {innerDivs}
    </div>
    </>
  );
};