export const PlusIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      className="h-4 w-4"
      {...props}
    >
      <path
        fill-rule="evenodd"
        d="M13 11h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 112 0v7z"
        clip-rule="evenodd"
      />
    </svg>
  );
};
