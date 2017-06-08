import * as React from 'react';

interface InfoButtonProps {
  pressed: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * An info button for the toolbar. When clicked it should
 * toggle its 'pressed' state
 */
const InfoButton: React.SFC<InfoButtonProps> = ({ pressed, onClick }) => {
  return (
    <button
      type="button"
      className="toolbar-button icon-button info-button"
      onClick={onClick}
      aria-pressed={String(pressed)}
    >
      <img className="button-icon" width={24} height={24} src="" alt=""/>
      {pressed ? 'Hide route info' : 'Show route info'}
    </button>
  );
};

export default InfoButton;
