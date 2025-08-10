import React from "react";

export const TwitterIcon = ({
  color,
  width,
  height,
}: {
  color: string;
  width?: string;
  height?: string;
}) => {
  return (
    <div style={{ width, height }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        viewBox="0 0 512.000000 512.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M2880 4000 l0 -160 -160 0 -160 0 0 -320 0 -320 -480 0 -480 0 0 160
    0 160 -480 0 -480 0 0 -160 0 -160 160 0 160 0 0 -160 0 -160 160 0 160 0 0
    -160 0 -160 160 0 160 0 0 -320 0 -320 160 0 160 0 0 -160 0 -160 -480 0 -480
    0 0 -160 0 -160 160 0 160 0 0 -160 0 -160 480 0 480 0 0 160 0 160 320 0 320
    0 0 160 0 160 160 0 160 0 0 160 0 160 160 0 160 0 0 160 0 160 160 0 160 0 0
    480 0 480 160 0 160 0 0 160 0 160 160 0 160 0 0 160 0 160 -160 0 -160 0 0
    160 0 160 -160 0 -160 0 0 -160 0 -160 -160 0 -160 0 0 160 0 160 -320 0 -320
    0 0 -160z"
          />
        </g>
      </svg>
    </div>
  );
};
