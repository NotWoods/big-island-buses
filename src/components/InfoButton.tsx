import * as React from 'react';

interface InfoButtonProps {
  pressed: boolean;
  onClick(): void;
}

/**
 * An info button for the toolbar. When clicked it should
 * toggle its 'pressed' state
 */
const InfoButton: React.SFC<InfoButtonProps> = props => (
  <button
    type="button"
    className="toolbar-button info-button"
    onClick={props.onClick}
    aria-pressed={String(props.pressed)}
    title="Info"
  >
    <img width={24} height={24} src=""/>
  </button>
);

export default InfoButton;
