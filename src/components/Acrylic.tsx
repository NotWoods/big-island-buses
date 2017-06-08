import * as React from 'react';

import '../css/Acrylic.css';

interface AcrylicProps {
  r?: number;
  g?: number;
  b?: number;
  hex?: string;
  opacity?: number;
  img: string;
  style?: React.CSSProperties;
  className?: string;
}

type ColorObject = { r: number, g: number, b: number };

function hexToRgb(hex: string): ColorObject | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

const Acrylic: React.SFC<AcrylicProps> = props => {
  let colorObject: Partial<ColorObject> = props;
  if (props.hex) {
    const result = hexToRgb(props.hex);
    if (result) { colorObject = result; }
  }
  const { r, g, b } = colorObject;

  const color = `rgba(${r},${g},${b},${props.opacity})`;
  const img = `url(${props.img}`;

  let className = 'acrylic';
  if (props.className) { className += ' ' + props.className; }

  return (
    <div className={className} style={props.style}>
      <div className="acrylic-img" style={{ backgroundImage: img }} />
      <div className="acrylic-tint" style={{ backgroundColor: color }} />
    </div>
  );
};

Acrylic.defaultProps = {
  r: 51,
  g: 51,
  b: 51,
  opacity: 0.6,
};

export default Acrylic;
