import { useState } from "react";
import API, { downloadReport } from "./services/api";
import Buttons from "./components/Buttons";
import LoadingSpinner from "./components/LoadingSpinner";
import ProjectModal from "./components/ProjectModal";
import ErrorModal from "./components/ErrorModal";

function App() {

  const [topic, setTopic] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [research, setResearch] = useState(null);
  const [researching, setResearching] = useState(false);

  const [plan, setPlan] = useState(null);
  const [planning, setPlanning] = useState(false);

  const [techStack, setTechStack] = useState(null);
  const [loadingTechStack, setLoadingTechStack] = useState(false);

  const [synopsis, setSynopsis] = useState(null);
  const [loadingSynopsis, setLoadingSynopsis] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);

  const [errorData, setErrorData] = useState({
    title: "",
    message: "",
  });

  const showError = (title, message) => {
    setErrorData({
      title,
      message,
    });
    setShowErrorModal(true);
  };

  const discoverProjects = async () => {

    if (!topic.trim()) {
      alert("Please enter a project domain.");
      return;
    }

    setLoading(true);

    try {

      const response = await API.post("/discover", {
        topic,
      });

      setProjects(response.data.result);

    } catch (error) {

      console.error(error);

      alert("Failed to fetch projects.");

    }

    setLoading(false);

  };

  const analyzeProject = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await API.post("/analyze", {
        project: selectedProject,
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        showError(
          "AI Request Limit Reached",
          "Please try again in a minute.\n\nProject DORA is working correctly.\nThis is a temporary Gemini API limit."
        );
      } else {
        showError(
          "Analysis Failed",
          "Something went wrong while generating the project analysis.\n\nPlease try again later."
        );
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const researchProject = async () => {
    setResearching(true);
    setResearch(null);
    try {
      const response = await API.post("/research", {
        project: selectedProject,
      });
      setResearch(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        showError(
          "AI Request Limit Reached",
          "Please try again in a minute.\n\nProject DORA is working correctly.\nThis is a temporary Gemini API limit."
        );
      } else {
        showError(
          "Research Failed",
          "Something went wrong while generating the research report.\n\nPlease try again later."
        );
      }
    } finally {
      setResearching(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysis) {
      showError("Missing Analysis", "Please analyze the project first.");
      return;
    }
    if (!research) {
      showError("Missing Research", "Please generate the research report first.");
      return;
    }
    try {
      await downloadReport(
        selectedProject,
        analysis,
        research
      );
    } catch (error) {
      console.error(error);
      showError(
        "Download Failed",
        "Unable to generate the PDF report.\n\nPlease try again later."
      );
    } finally {
    }
  };

  const generateProjectPlan = async () => {
    setPlanning(true);
    setPlan(null);
    try {
      const response = await API.post("/planner", {
        project: selectedProject,
      });
      console.log(response.data);
      if (response.data.error) {
        showError("Request Error", response.data.error);
        return;
      }
      setPlan(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        showError(
          "AI Request Limit Reached",
          "Please try again in a minute.\n\nProject DORA is working correctly.\nThis is a temporary Gemini API limit."
        );
      } else {
        showError(
          "Plan Generation Failed",
          "Something went wrong while generating the implementation plan.\n\nPlease try again later."
        );
      }
    } finally {
      setPlanning(false);
    }
  };

  const generateTechStack = async () => {
    setLoadingTechStack(true);
    setTechStack(null);
    try {
      const response = await API.post("/techstack", {
        project: selectedProject,
      });
      if (response.data.error) {
        showError("Request Error", response.data.error);
        return;
      }
      setTechStack(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        showError(
          "AI Request Limit Reached",
          "Please try again in a minute.\n\nProject DORA is working correctly.\nThis is a temporary Gemini API limit."
        );
      } else {
        showError(
          "Tech Stack Generation Failed",
          "Something went wrong while generating the technology stack.\n\nPlease try again later."
        );
      }
    } finally {
      setLoadingTechStack(false);
    }
  };

  const generateSynopsis = async () => {
    setLoadingSynopsis(true);
    setSynopsis(null);
    try {
      const response = await API.post("/synopsis", {
        project: selectedProject,
      });
      if (response.data.error) {
        showError("Request Error", response.data.error);
        return;
      }
      setSynopsis(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        showError(
          "AI Request Limit Reached",
          "Please try again in a minute.\n\nProject DORA is working correctly.\nThis is a temporary Gemini API limit."
        );
      } else {
        showError(
          "Synopsis Generation Failed",
          "Something went wrong while generating the project synopsis.\n\nPlease try again later."
        );
      }
    } finally {
      setLoadingSynopsis(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

      <div className="max-w-7xl mx-auto px-10 py-12">

        {/* Heading */}

        <h1 className="text-6xl font-extrabold text-cyan-400 tracking-tight">

          Project Dora 🚀

        </h1>

        <p className="text-slate-400 text-xl mt-3 mb-12">

          Discover, Analyze, and Build AI-Powered Project Ideas for Your Next Innovation.

        </p>

        {/* Search */}

        <div className="flex gap-4 mb-10">

          <input

            type="text"

            value={topic}

            onChange={(e) => setTopic(e.target.value)}

            placeholder="Enter a domain (Cyber Security, AI, Blockchain...)"

            className="
              flex-1
              px-6
              py-4
              bg-slate-800
              rounded-xl
              text-white
              text-lg
              placeholder:text-slate-400
              border
              border-slate-700
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400
              transition
            "

          />

          <button

            onClick={discoverProjects}

            className="
              px-8
              py-4
              rounded-xl
              bg-cyan-500
              hover:bg-cyan-400
              transition
              font-semibold
              shadow-lg
              shadow-cyan-500/20
            "

          >

            Discover

          </button>

        </div>

        {/* Loading */}

        {loading && (

          <LoadingSpinner text="Dora is generating innovative project ideas..." />

        )}

        {/* Results */}

        {projects.length > 0 && (

          <h2 className="text-3xl font-bold mb-8 text-cyan-300">

            AI Generated Projects

          </h2>

        )}

        <div className="grid gap-8">

          {projects.map((project, index) => (

            <div

              key={index}

              className="
                bg-slate-800/80
                border
                border-cyan-500/20
                rounded-2xl
                p-8
                shadow-xl
                hover:shadow-cyan-500/20
                hover:scale-[1.01]
                transition-all
              "

            >

              <h2 className="text-3xl font-bold text-cyan-300 mb-5">

                {project["Project Title"]}

              </h2>

              <p className="text-slate-300 leading-8">

                {project["Short Description"]}

              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

                <div className="bg-slate-900 rounded-xl p-4 text-center">

                  <p className="text-slate-400 text-sm">

                    Difficulty

                  </p>

                  <p className="text-cyan-400 text-2xl font-bold">

                    {project["Difficulty"]}/10

                  </p>

                </div>

                <div className="bg-slate-900 rounded-xl p-4 text-center">

                  <p className="text-slate-400 text-sm">

                    Innovation

                  </p>

                  <p className="text-cyan-400 text-2xl font-bold">

                    {project["Innovation Score"]}/10

                  </p>

                </div>

                <div className="bg-slate-900 rounded-xl p-4 text-center">

                  <p className="text-slate-400 text-sm">

                    Resume

                  </p>

                  <p className="text-cyan-400 text-2xl font-bold">

                    {project["Resume Value"]}/10

                  </p>

                </div>

                <div className="bg-slate-900 rounded-xl p-4 text-center">

                  <p className="text-slate-400 text-sm">

                    Interview

                  </p>

                  <p className="text-cyan-400 text-2xl font-bold">

                    {project["Interview Value"]}/10

                  </p>

                </div>

              </div>

                            <div className="mt-8 flex justify-end">

                <button
                  onClick={() => {
                    setAnalysis(null);
                    setResearch(null);
                    setPlan(null);
                    setTechStack(null);
                    setSynopsis(null);
                    setAnalyzing(false);
                    setResearching(false);
                    setPlanning(false);
                    setLoadingTechStack(false);
                    setLoadingSynopsis(false);
                    setSelectedProject(project);
                    setShowModal(true);
                  }}
                  className="
                    bg-cyan-500
                    hover:bg-cyan-400
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                    transition
                    shadow-lg
                    shadow-cyan-500/20
                  "
                >
                  View Details →
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* =========================
            PROJECT DETAILS MODAL
        ========================== */}

        {showModal && selectedProject && (
          <ProjectModal
            showModal={showModal}
            setShowModal={setShowModal}
            selectedProject={selectedProject}
            analyzeProject={analyzeProject}
            researchProject={researchProject}
            handleDownloadReport={handleDownloadReport}
            generateProjectPlan={generateProjectPlan}
            generateTechStack={generateTechStack}
            generateSynopsis={generateSynopsis}
            analyzing={analyzing}
            researching={researching}
            planning={planning}
            loadingTechStack={loadingTechStack}
            loadingSynopsis={loadingSynopsis}
            analysis={analysis}
            research={research}
            plan={plan}
            techStack={techStack}
            synopsis={synopsis}
          />
        )}

        <ErrorModal
          show={showErrorModal}
          title={errorData.title}
          message={errorData.message}
          onClose={() => setShowErrorModal(false)}
        />

      </div>

    </div>

  );

}

export default App; 