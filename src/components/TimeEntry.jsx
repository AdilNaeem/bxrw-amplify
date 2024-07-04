import { useEffect, useRef, useState } from 'react';


export const TimeEntry = ({changeTimeEntry}) => {
    const [fieldValue, setFieldValue] = useState("");

    const changeFieldValue = (value) => {
        if (!value.includes('t')) {
            setFieldValue(value);
        }
    }

    const inputRef = useRef();
    
      useEffect(() => {
        inputRef.current.focus();

        inputRef.value = '';
      }, []);

    function handleTimeEntry(e) {
        e.preventDefault()
        changeTimeEntry(parseFloat(fieldValue));
    }

    return (<div className="popup">
    <div className="popup-inner">
        <form onSubmit={handleTimeEntry}>
            <label>
                Enter new time:
                <input ref={inputRef} type="text" value={fieldValue} onChange={e => changeFieldValue(e.target.value)} />
            </label>
            <button type="submit">Go</button>
        </form>
    </div>
    </div>);
};