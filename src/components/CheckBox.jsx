export const CheckBox = ( {displayName, selectedValue, updateSelectedValue, disabled} ) => {

  return (
    <form>
      <label>
        <input
          type="checkbox"
          checked={selectedValue}
          onChange={updateSelectedValue}
          disabled={disabled}
        />
        {displayName}
      </label>
    </form>
  );
};