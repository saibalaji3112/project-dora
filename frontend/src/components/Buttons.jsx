function Buttons({
  analyzeProject,
  researchProject,
  generateProjectPlan,
  generateTechStack,
  generateSynopsis,
  handleDownloadReport,

  analyzing,
  researching,
  planning,
  loadingTechStack,
  loadingSynopsis,

  closeModal,
}) {
  return (
    <div className="mt-10 flex flex-wrap justify-end gap-4">

      <button
        onClick={closeModal}
        className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl transition"
      >
        Close
      </button>

      <button
        onClick={analyzeProject}
        disabled={analyzing}
        className="bg-cyan-500 hover:bg-cyan-400 px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
      >
        {analyzing ? "Analyzing..." : "🤖 Analyze Project"}
      </button>

      <button
        onClick={researchProject}
        disabled={researching}
        className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
      >
        {researching ? "Researching..." : "📚 Research"}
      </button>

      <button
        onClick={generateProjectPlan}
        disabled={planning}
        className="bg-orange-600 hover:bg-orange-500 px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
      >
        {planning ? "Generating..." : "🗺️ Generate Plan"}
      </button>

      <button
        onClick={generateTechStack}
        disabled={loadingTechStack}
        className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
      >
        {loadingTechStack ? "Generating..." : "💻 Tech Stack"}
      </button>

      <button
        onClick={generateSynopsis}
        disabled={loadingSynopsis}
        className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
      >
        {loadingSynopsis ? "Generating..." : "📝 Synopsis"}
      </button>

      <button
        onClick={handleDownloadReport}
        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl font-semibold transition"
      >
        📄 Download Report
      </button>

    </div>
  );
}

export default Buttons;