function LoadingSpinner({
  text,
  color = "cyan",
}) {
  const colors = {
    cyan: {
      border: "border-cyan-400",
      text: "text-cyan-300",
    },
    purple: {
      border: "border-purple-400",
      text: "text-purple-300",
    },
    orange: {
      border: "border-orange-400",
      text: "text-orange-300",
    },
    blue: {
      border: "border-blue-400",
      text: "text-blue-300",
    },
    emerald: {
      border: "border-emerald-400",
      text: "text-emerald-300",
    },
  };

  const theme = colors[color] || colors.cyan;

  return (
    <div className="flex items-center gap-3 my-6">

      <div
        className={`w-6 h-6 border-4 ${theme.border} border-t-transparent rounded-full animate-spin`}
      ></div>

      <span
        className={`text-lg ${theme.text}`}
      >
        {text}
      </span>

    </div>
  );
}

export default LoadingSpinner;