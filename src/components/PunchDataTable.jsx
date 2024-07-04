import './PunchDataTable.css';

const displayHand = (longForm =>
    longForm === 'left' ? 
        '(L)' : 
        longForm === 'right' ?
        '(R)' :
        ''
);

const PunchDataTable = ( { punchData, prefix, cbTimeCode, changeSelectedBoxer, videoRef } ) => {

    const punchRows = punchData.toSorted(function(a, b){return b.startTime - a.startTime}).
        filter((punch) =>
            punch.startTime !== null && punch.endTime !== null
        ).map((punch, index) =>
            <tr 
                key={`punch-data-row-${prefix}-${index}`}
                className={punch.finished() ? '' : 'unfinished'}
                onClick={(e) => {
                    changeSelectedBoxer(prefix);
                    videoRef.current.currentTime = punch.startTime;
                    cbTimeCode(punch.startTime);
                }} >
            <td>{`${punch.punchType} ${displayHand(punch.hand)}`}</td>
            <td>{`${punch.startTime.toFixed(2)}`}</td>
            <td>{`${punch.endTime.toFixed(2)}`}</td>
            </tr>
        );

    return (
        <div className='punch-data-table-container'>
            <table className='punch-data-table'>
                <thead className='punch-data-table-header'>
                    <tr>
                    <th>Punch data</th>
                    <th>Start time</th>
                    <th>End time</th>
                    </tr>
                </thead>
                <tbody className='punch-data-table-body'>
                    {punchRows}
                </tbody>
            </table>
        </div>
    );
};

export default PunchDataTable;