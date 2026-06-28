function AnalysisSection({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="mt-10">

      <hr className="border-slate-700 mb-8" />

      <h2 className="text-3xl font-bold text-cyan-400 mb-8">
        AI Project Analysis
      </h2>

      <div className="space-y-8">

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Overview
          </h3>
          <p>{analysis.overview}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Innovation
          </h3>
          <p>{analysis.innovation}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Industry Demand
          </h3>
          <p>{analysis.industry_demand}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Real World Applications
          </h3>

          <ul className="list-disc list-inside">
            {analysis.real_world_applications?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Required Skills
          </h3>

          <ul className="list-disc list-inside">
            {analysis.required_skills?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Software Requirements
          </h3>

          <ul className="list-disc list-inside">
            {analysis.software_requirements?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Hardware Requirements
          </h3>

          <ul className="list-disc list-inside">
            {analysis.hardware_requirements?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Development Steps
          </h3>

          <ul className="list-disc list-inside">
            {analysis.development_steps?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Challenges
          </h3>

          <ul className="list-disc list-inside">
            {analysis.challenges?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Future Scope
          </h3>

          <ul className="list-disc list-inside">
            {analysis.future_scope?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Resume Value
          </h3>
          <p>{analysis.resume_value}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">
            Interview Questions
          </h3>

          <ul className="list-disc list-inside">
            {analysis.interview_questions?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>

      </div>

    </div>
  );
}

export default AnalysisSection;