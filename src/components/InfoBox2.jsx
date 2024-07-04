import { EntryField } from './EntryField';
import useKeyboardShortcut from "use-keyboard-shortcut";
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import { CheckBox } from './CheckBox';

const HAND_LIST = ['<empty>', 'left', 'right'];
const PUNCH_TYPE_LIST = ['<empty>', 'Jab', 'Cross', 'Overhand', 'Lead Hook', 'Rear Hook', 'Lead Upper', 'Rear Upper', 'Screwshot'];
const PUNCH_QUALITY_LIST = ['<empty>', 'Missed', '1', '2', '3'];
const TARGET_LIST = ['<empty>', 'Head', 'Body'];

const InfoBox2 = ( {
        selectedBoxer, 
        changeSelectedBoxer, 
        boxerNames, 
        punch, 
        punchMetaData, 
        setPunchMetaData,
        deletePunchInfo} ) => {

    const { punchDisabled, punchBehaviour } = deletePunchInfo;
    const isFeint = punchMetaData.punchType == 'Feint' || punch?.punchType == 'Feint';

    // Keyboard short-cuts START
    // Keyboard short-cuts START
  const defaultKbShortcutOptions = { 
    overrideSystem: false,
    ignoreInputFields: false, 
    repeatOnHold: false 
  };
  useKeyboardShortcut(
      ["x"],
      shortcutKeys => {
          if (selectedBoxer === 'boxer1') {
            changeSelectedBoxer('boxer2');
          } else {
            changeSelectedBoxer('boxer1');
          }
      },
      defaultKbShortcutOptions
  );
    // Hand: left/right
    useKeyboardShortcut(
        ["l"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, hand: 'left'});
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["r"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, hand: 'right'});
        },
        defaultKbShortcutOptions
    );
    // Target: head/body
    useKeyboardShortcut(
        ["h"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, target: 'Head'});
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["b"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, target: 'Body'});
        },
        defaultKbShortcutOptions
    );
    // Quality: 0 or m (Missed), 1, 2, 3
    useKeyboardShortcut(
        ["0"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, punchQuality: 'Missed'});
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["m"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, punchQuality: 'Missed'});
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["1"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, punchQuality: '1'});
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["2"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, punchQuality: '2'});
        },
        defaultKbShortcutOptions
    );
    useKeyboardShortcut(
        ["3"],
        shortcutKeys => {
            if (!punchDisabled) setPunchMetaData({...punchMetaData, punchQuality: '3'});
        },
        defaultKbShortcutOptions
    );
    // Punch Type: Straight/Hook/Uppercut
    useKeyboardShortcut(
        ["y"],
        shortcutKeys => {
            if (!punchDisabled) togglePunchType();
        },
        defaultKbShortcutOptions
    );
    // Keyboard short-cuts END

    function togglePunchType() {
        let currentPunchType = punchMetaData['punchType'];
        let currentIndex = PUNCH_TYPE_LIST.indexOf(currentPunchType);
        currentIndex = (currentIndex + 1) % PUNCH_TYPE_LIST.length;
        let newPunchType = PUNCH_TYPE_LIST[currentIndex];
        setPunchMetaData({...punchMetaData, punchType: newPunchType});
    }

    const {hand, punchType, punchQuality, target} = punchMetaData;

    const boxerSelectorMapper = Object.fromEntries(
                boxerNames.map((val, index) => [val, `boxer${index+1}` ]));

    const changeSelectedBoxerId = (boxerName) => {
        let boxerId = boxerSelectorMapper[boxerName];
        changeSelectedBoxer(boxerId);
    }

    const disableKnockdown = !(['2', '3'].includes(punchMetaData['punchQuality']));

    const infoBoxEnabled = (
        <div id="info-box" className="info-box">
        <div className='punch-entry-header-container'>
                <div className='punch-entry-header'>PUNCH ENTRY</div>
                <Button
                        id='delete-punch-button'
                        onClick={punchBehaviour}
                        >
                        <DeleteIcon />
                </Button>        
        </div>
            <div id='info-box-times-grid'>
                <div className='info-box-time-element'>
                    START: <span id='info-box-start-time'>{punch ? `${punch.startTime.toFixed(2)} secs ` : ''}</span>
                </div>
                <div className='info-box-time-element'>
                   END: <span id='info-box-end-time'>{punch ? `${punch.endTime.toFixed(2)} secs ` : ''}</span>
                </div>
            
            </div>
            
            <EntryField
                    fieldName='Boxer'
                    fieldValues={boxerNames}
                    selectedValue={selectedBoxer}
                    updateSelectedValue={changeSelectedBoxerId}
                    fieldMapper={boxerSelectorMapper} />
            <EntryField 
                    fieldName='Hand'
                    fieldValues={HAND_LIST.slice(1)}
                    selectedValue={punchMetaData['hand']}
                    updateSelectedValue={(value) => setPunchMetaData({...punchMetaData, 'hand': value})} />
            <EntryField 
                    fieldName='Punch type'
                    fieldValues={PUNCH_TYPE_LIST.slice(1)}
                    selectedValue={punchMetaData['punchType']}
                    updateSelectedValue={(value) => setPunchMetaData({...punchMetaData, 'punchType': value})} />
            <EntryField 
                    fieldName='Target'
                    fieldValues={TARGET_LIST.slice(1)}
                    selectedValue={punchMetaData['target']}
                    updateSelectedValue={(value) => setPunchMetaData({...punchMetaData, 'target': value})} />
            <EntryField 
                    fieldName='Punch quality'
                    fieldValues={PUNCH_QUALITY_LIST.slice(1)}
                    selectedValue={punchMetaData['punchQuality']}
                    updateSelectedValue={(value) => setPunchMetaData({...punchMetaData, 'punchQuality': value})} />
            <CheckBox 
                displayName='Knockdown'
                selectedValue={punchMetaData['knockdown']}
                updateSelectedValue={(event) => setPunchMetaData({...punchMetaData, 'knockdown': event.target.checked})}
                disabled={disableKnockdown} />
            <CheckBox 
                displayName='Rear foot off the ground'
                selectedValue={punchMetaData['footOffGround']}
                updateSelectedValue={(event) => setPunchMetaData({...punchMetaData, 'footOffGround': event.target.checked})}
                 />
        </div>
    );

    const infoBoxDisabled = (
        <div id="info-box" className="info-box">
        <div className='punch-entry-header-container'>
                <div className='punch-entry-header'>PUNCH ENTRY</div>   
        </div>
            <div id='info-box-times-grid'>
                <div className='info-box-time-element'>
                    START: <span id='info-box-start-time'>{punch ? `${punch.startTime.toFixed(2)} secs ` : ''}</span>
                </div>
                <div className='info-box-time-element'>
                   END: <span id='info-box-end-time'>{punch ? `${punch.endTime.toFixed(2)} secs ` : ''}</span>
                </div>
            
            </div>
            
            <EntryField
                    fieldName='Boxer'
                    fieldValues={boxerNames}
                    selectedValue={selectedBoxer}
                    updateSelectedValue={changeSelectedBoxerId}
                    fieldMapper={boxerSelectorMapper} />

            <div className='info-box-time-element'>
                <p>Select a Start point and an End point from the video to record a Punch Entry</p>
            </div>
        </div>
    );

    const infoBoxFeint = (
        <div id="info-box" className="info-box">
        <div className='punch-entry-header-container'>
                <div className='punch-entry-header'>FEINT</div>   
                <Button
                        id='delete-punch-button'
                        onClick={punchBehaviour}
                        >
                        <DeleteIcon />
                </Button>    
        </div>
            <div id='info-box-times-grid'>
                <div className='info-box-time-element'>
                    START: <span id='info-box-start-time'>{punch ? `${punch.startTime.toFixed(2)} secs ` : ''}</span>
                </div>
                <div className='info-box-time-element'>
                   END: <span id='info-box-end-time'>{punch ? `${punch.endTime.toFixed(2)} secs ` : ''}</span>
                </div>
            
            </div>
            
            <EntryField
                    fieldName='Boxer'
                    fieldValues={boxerNames}
                    selectedValue={selectedBoxer}
                    updateSelectedValue={changeSelectedBoxerId}
                    fieldMapper={boxerSelectorMapper} />

        </div>
    );

    return (
        punchDisabled ? infoBoxDisabled : isFeint ? infoBoxFeint : infoBoxEnabled
    );

}

export default InfoBox2;