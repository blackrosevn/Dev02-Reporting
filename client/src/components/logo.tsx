import { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      width="144"
      height="40"
      viewBox="0 0 144 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M40 20C40 31.046 31.046 40 20 40C8.954 40 0 31.046 0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20Z"
        fill="#203864"
      />
      <path
        d="M10 14L17.5 19.5M17.5 19.5L25 25M17.5 19.5V30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 16L30.5 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 11H55.5C56.873 11 58 12.127 58 13.5V14.5C58 15.873 56.873 17 55.5 17H53V24H50V11ZM53 14H55V14.5C55 14.776 54.776 15 54.5 15H53V14Z"
        fill="#203864"
      />
      <path d="M60 11H63V24H60V11Z" fill="#203864" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M66 11H72.5C73.873 11 75 12.127 75 13.5V21.5C75 22.873 73.873 24 72.5 24H66V11ZM69 14V21H72V14H69Z"
        fill="#203864"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M77 11H82.5C83.873 11 85 12.127 85 13.5V14.5C85 15.596 84.304 16.535 83.338 16.868C84.304 17.201 85 18.14 85 19.236V21.5C85 22.873 83.873 24 82.5 24H77V11ZM80 14H82V14.5C82 14.776 81.776 15 81.5 15H80V14ZM80 18H82V21H80V18Z"
        fill="#203864"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M87 11H92.5C93.873 11 95 12.127 95 13.5V14.5C95 15.343 94.606 16.089 93.984 16.53C94.606 16.972 95 17.719 95 18.563V21.5C95 22.873 93.873 24 92.5 24H87V11ZM90 14H92V14.5C92 14.776 91.776 15 91.5 15H90V14ZM90 18H92V21H90V18Z"
        fill="#203864"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M97 11H106V14H103V24H100V14H97V11Z"
        fill="#203864"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M108 11H115V14H111V16H115V19H111V21H115V24H108V11Z"
        fill="#203864"
      />
      <path
        d="M117 11H121L123 19.5L125 11H129V24H126V16L124 24H122L120 16V24H117V11Z"
        fill="#203864"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M54 26H58.3324L59.6247 30.5L60.917 26H65.2494V39H62.2994V31L60.6247 39H58.6247L56.95 31V39H54V26Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M68 26H75.5C76.873 26 78 27.127 78 28.5V36.5C78 37.873 76.873 39 75.5 39H68V26ZM71 29V36H75V29H71Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M81 26H88.5C89.873 26 91 27.127 91 28.5V36.5C91 37.873 89.873 39 88.5 39H81V26ZM84 29V36H88V29H84Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M93 26H100.5C101.873 26 103 27.127 103 28.5V36.5C103 37.873 101.873 39 100.5 39H93V26ZM96 29V36H100V29H96Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M105 26H109.5C110.873 26 112 27.127 112 28.5V30.5C112 31.873 110.873 33 109.5 33H108V39H105V26ZM108 29H109V30.5C109 30.776 108.776 31 108.5 31H108V29Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M114 26H123V29H120V39H117V29H114V26Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M124 26H133.5C134.873 26 136 27.127 136 28.5V36.5C136 37.873 134.873 39 133.5 39H124V26ZM127 29V36H133V29H127Z"
        fill="#4472C4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M138 26H144V29H141V31H144V34H141V36H144V39H138V26Z"
        fill="#4472C4"
      />
    </svg>
  );
}

export default Logo;
