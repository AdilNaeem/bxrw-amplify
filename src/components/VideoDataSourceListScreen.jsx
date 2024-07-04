import React, { useState } from 'react';

export const VideoDataSourceListScreen = ( {dataSources, selectedDataSource, setSelectedDataSource, errorMessage, signOut} ) => {
    const [selectedEvent, setSelectedEvent] = useState(null);

    if (errorMessage !== null) {
        return (<div>{errorMessage}</div>);
    }

    // dataSource contains a list of all available rounds to be labelled.
    // Each round has a `description` that records what event or session
    // it is part of, and a `round` number.
    const hierarchicalDataSources = dataSources.reduce((acc, item) => {
        // Check if the key already exists in the accumulator
        if (!acc[item.description]) {
            // If not, create a new array with the current item
            acc[item.description] = [item];
        } else {
            // If it exists, push the current item into the existing array
            acc[item.description].push(item);
        }
        return acc;
    }, {});

    const toggleSelectedEvent = (description) => {
        if (selectedEvent) {
            if (selectedEvent === description) {
                setSelectedEvent(null);
            } else {
                setSelectedEvent(description);
            }
        } else {
            setSelectedEvent(description);
        }
    }

    const getChevron = (description) => {
        if (selectedEvent && selectedEvent === description) {
            return 'V';
        } else {
            return '>';
        }

    }

    const dataSourceList =  Object.entries(hierarchicalDataSources).map(([description, records]) => (
        <div 
            key={description}
            className="data-source-list-event-div"
            onClick={() => {
                toggleSelectedEvent(description);
            }}>
          {getChevron(description)} {description}
          {records
            .map((record, index) => (
              selectedEvent && record.description === selectedEvent &&
              <div 
                key={`${record.id}`} 
                className='round-record'
                onClick={() => {
                    setSelectedDataSource(record);
                }}>
                    Round: {record.round} {record.segment}
              </div>
            ))
          }
        </div>
      ))

    return  (
        <>
        <a onClick={signOut} className='clickable-link'>Sign out</a>
        <span id="labelling-header">{selectedDataSource && selectedDataSource.description}</span>
        <div id="listScreen">
          {dataSourceList}
        </div>
        </>
    )
};
   
    
      
