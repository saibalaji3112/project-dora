function ErrorModal({
  show,
  title,
  message,
  onClose,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">

      <div className="bg-slate-900 border border-red-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl">

        <div className="text-5xl mb-4 text-center">
          ⚠️
        </div>

        <h2 className="text-2xl font-bold text-red-400 text-center mb-4">
          {title}
        </h2>

        <p className="text-slate-200 whitespace-pre-line text-center leading-7">
          {message}
        </p>

        <div className="flex justify-center mt-8">

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-xl font-semibold transition"
          >
            OK
          </button>

        </div>

      </div>

    </div>
  );
}

export default ErrorModal;