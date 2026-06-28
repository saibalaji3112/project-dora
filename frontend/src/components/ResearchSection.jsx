function ResearchSection({ research }) {
  if (!research) return null;

  return (
    <div className="mt-10">
      <hr className="border-slate-700 mb-8" />

      <h2 className="text-3xl font-bold text-purple-400 mb-8">
        AI Research Report
      </h2>

      <div className="space-y-8">

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Research Keywords
          </h3>

          <ul className="list-disc list-inside">
            {research.research_keywords?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Literature Summary
          </h3>

          <p>{research.literature_summary}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Research Gap
          </h3>

          <p>{research.research_gap}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Novelty Score
          </h3>

          <p>{research.novelty_score}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Recent Trends
          </h3>

          <ul className="list-disc list-inside">
            {research.recent_trends?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Future Research Directions
          </h3>

          <ul className="list-disc list-inside">
            {research.future_research_directions?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Publication Potential
          </h3>

          <p>{research.publication_potential}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Recommended Datasets
          </h3>

          <ul className="list-disc list-inside">
            {research.recommended_datasets?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Recommended Tools
          </h3>

          <ul className="list-disc list-inside">
            {research.recommended_tools?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2">
            Possible Research Titles
          </h3>

          <ul className="list-disc list-inside">
            {research.possible_research_titles?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <h3 className="text-xl font-semibold text-purple-300 mb-2">
              Implementation Difficulty
            </h3>

            <p>{research.implementation_difficulty}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-purple-300 mb-2">
              Estimated Completion Time
            </h3>

            <p>{research.estimated_completion_time}</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ResearchSection;