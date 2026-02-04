import SvgIcon from "@mui/material/SvgIcon";

export default function BodyBiometricIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Scan frame */}
      <path
        d="M4 3h5v2H6v3H4V3
           m10 0h5v5h-2V5h-3V3
           M4 16h2v3h3v2H4v-5
           m13 0h2v5h-5v-2h3v-3z"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Body silhouette – pushed DOWN for more top space */}
      <g transform="translate(12 10.7) scale(0.75) translate(-12 -12)">
        <path
          d="M12 7
             a2.5 2.5 0 1 0 0-5
             a2.5 2.5 0 0 0 0 5
             m0 2
             c-3.2 0-5.5 1.8-5.5 4.2
             V18
             c0 .6.4 1 1 1
             h9
             c.6 0 1-.4 1-1
             v-4.8
             C17.5 10.8 15.2 9 12 9z"
          fill="currentColor"
        />
      </g>
    </SvgIcon>
  );
}
