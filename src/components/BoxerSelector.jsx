import useKeyboardShortcut from "use-keyboard-shortcut";

export const BoxerSelector = ( {selectedBoxer, setSelectedBoxer, boxerNames} ) => {
  
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
            setSelectedBoxer('boxer2');
          } else {
            setSelectedBoxer('boxer1');
          }
      },
      defaultKbShortcutOptions
  );

  const handleOptionChange = changeEvent => {
    setSelectedBoxer(changeEvent.target.value);
  };

  return (
    <div className="radio-button-container">
        <form className="toggle-radio">
            <input 
                type="radio" 
                id="boxer1" 
                name="boxer" 
                value="boxer1" 
                checked={selectedBoxer === 'boxer1'}
                onChange={handleOptionChange} />
            <label htmlFor="boxer1">{boxerNames && boxerNames[0]}</label>
        
            <input 
                type="radio" 
                id="boxer2" 
                name="boxer" 
                value="boxer2" 
                checked={selectedBoxer === 'boxer2'}
                onChange={handleOptionChange} />
            <label htmlFor="boxer2">{boxerNames && boxerNames[1]}</label>
        </form>
    </div> 
  );
};