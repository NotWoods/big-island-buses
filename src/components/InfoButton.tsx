import * as React from 'react';

interface InfoButtonProps {
  pressed: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * An info button for the toolbar. When clicked it should
 * toggle its 'pressed' state
 */
const InfoButton: React.SFC<InfoButtonProps> = props => (
  <button
    type="button"
    className="toolbar-button icon-button info-button"
    onClick={props.onClick}
    aria-pressed={String(props.pressed)}
    title="Toggle route info"
  >
    <img width={24} height={24} src="" alt="Toggle route info"/>
  </button>
);

export default InfoButton;
