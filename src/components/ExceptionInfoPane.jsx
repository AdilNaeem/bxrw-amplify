import React, { useState } from 'react';
import { matchException, attributeException } from '../lib/exception';

 
const ExceptionInfoPane = ( {exception }) => {
    const {exceptionType, startTime, ...otherExceptionInfo} = exception;
    
    if (exceptionType == 'EMPTY') {
        return (
            <div></div>
        )
    };

    let message = exceptionType === 'MATCH_EXCEPTION' ?
        (matchException(exception)) :
        (attributeException(exception));


    return (
        <div className='exception-info-pane-container'>
            <div className='exception-info-pan'>
                {message}
            </div>
        </div>
    );
};
 
export default ExceptionInfoPane;