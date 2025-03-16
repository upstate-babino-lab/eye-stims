interface CloseButtonProps {
  onClick: () => void;
}

// eslint-disable-next-line react/prop-types
const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );

  return (
    <button className="text-2xl" onClick={onClick}>
      &times;
    </button>
  );
};

export default CloseButton;
