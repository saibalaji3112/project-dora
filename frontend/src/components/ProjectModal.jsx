import LoadingSpinner from "./LoadingSpinner";
import AnalysisSection from "./AnalysisSection";
import ResearchSection from "./ResearchSection";
import PlannerSection from "./PlannerSection";
import TechStackSection from "./TechStackSection";
import SynopsisSection from "./SynopsisSection";

function ProjectModal({
  showModal,
  setShowModal,

  selectedProject,

  analyzeProject,
  researchProject,
  handleDownloadReport,
  generateProjectPlan,
  generateTechStack,
  generateSynopsis,

  analyzing,
  researching,
  planning,
  loadingTechStack,
  loadingSynopsis,

  analysis,
  research,
  plan,
  techStack,
  synopsis,
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto z-50">

      <div className="max-w-5xl mx-auto my-12 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 p-10">

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-4xl font-bold text-cyan-400">
            {selectedProject["Project Title"]}
          </h2>

          <button
            onClick={() => setShowModal(false)}
            className="
              bg-red-600
              hover:bg-red-500
              px-5
              py-2
              rounded-xl
              font-semibold
            "
          >
            ✕ Close
          </button>

        </div>

        <div className="space-y-6">

          <div>

            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
              Description
            </h3>

            <p>{selectedProject["Short Description"]}</p>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <h3 className="font-semibold text-cyan-300">
                Difficulty
              </h3>

              <p>{selectedProject.Difficulty}/10</p>

            </div>

            <div>

              <h3 className="font-semibold text-cyan-300">
                Innovation Score
              </h3>

              <p>{selectedProject["Innovation Score"]}/10</p>

            </div>

            <div>

              <h3 className="font-semibold text-cyan-300">
                Resume Value
              </h3>

              <p>{selectedProject["Resume Value"]}/10</p>

            </div>

            <div>

              <h3 className="font-semibold text-cyan-300">
                Interview Value
              </h3>

              <p>{selectedProject["Interview Value"]}/10</p>

            </div>

            <div>

              <h3 className="font-semibold text-cyan-300">
                Development Time
              </h3>

              <p>{selectedProject["Estimated Development Time"]}</p>

            </div>

            <div>

              <h3 className="font-semibold text-cyan-300">
                Recommended Tech Stack
              </h3>

              <p>{selectedProject["Recommended Tech Stack"]}</p>

            </div>

          </div>

          <div>

            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
              Major Modules
            </h3>

            <ul className="list-disc list-inside">

              {selectedProject["Major Modules"]?.map((module, index) => (
                <li key={index}>{module}</li>
              ))}

            </ul>

          </div>

          <div className="flex flex-wrap gap-4 mt-10">

            <button
              onClick={analyzeProject}
              disabled={analyzing}
              className="
                bg-cyan-600
                hover:bg-cyan-500
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
                disabled:opacity-60
              "
            >
              {analyzing ? "Analyzing..." : "🧠 Analyze Project"}
            </button>

            <button
              onClick={researchProject}
              disabled={researching}
              className="
                bg-purple-600
                hover:bg-purple-500
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
                disabled:opacity-60
              "
            >
              {researching ? "Researching..." : "🔬 Research"}
            </button>

            <button
              onClick={handleDownloadReport}
              className="
                bg-green-600
                hover:bg-green-500
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
              "
            >
              📄 Download Report
            </button>

            <button
              onClick={generateProjectPlan}
              disabled={planning}
              className="
                bg-orange-600
                hover:bg-orange-500
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
                disabled:opacity-60
              "
            >
              {planning ? "Generating..." : "🗺️ Generate Plan"}
            </button>

            <button
              onClick={generateTechStack}
              disabled={loadingTechStack}
              className="
                bg-blue-600
                hover:bg-blue-500
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
                disabled:opacity-60
              "
            >
              {loadingTechStack ? "Generating..." : "💻 Tech Stack"}
            </button>

            <button
              onClick={generateSynopsis}
              disabled={loadingSynopsis}
              className="
                bg-emerald-600
                hover:bg-emerald-500
                px-8
                py-3
                rounded-xl
                font-semibold
                transition
                disabled:opacity-60
              "
            >
              {loadingSynopsis ? "Generating..." : "📝 Synopsis"}
            </button>

          </div>

          {analyzing && (
            <LoadingSpinner
              text="🧠 Dora is analyzing your project..."
              color="cyan"
            />
          )}

          <AnalysisSection analysis={analysis} />

          {researching && (
            <LoadingSpinner
              text="🔬 Dora is performing research analysis..."
              color="purple"
            />
          )}

          <ResearchSection research={research} />

          {planning && (
            <LoadingSpinner
              text="🗺️ Dora is generating your implementation roadmap..."
              color="orange"
            />
          )}

          <PlannerSection plan={plan} />

          {loadingTechStack && (
            <LoadingSpinner
              text="💻 Dora is recommending the best technology stack..."
              color="blue"
            />
          )}

          <TechStackSection techStack={techStack} />

          {loadingSynopsis && (
            <LoadingSpinner
              text="📝 Dora is generating your project synopsis..."
              color="emerald"
            />
          )}

          <SynopsisSection synopsis={synopsis} />

                  </div>

      </div>

    </div>
  );
}

export default ProjectModal;