function SynopsisSection({ synopsis }) {
  if (!synopsis) return null;

  return (
    <div className="mt-10">
      <hr className="border-slate-700 mb-8" />

      <h2 className="text-3xl font-bold text-emerald-400 mb-8">
        AI Project Synopsis
      </h2>

      <div className="space-y-8">

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Abstract
          </h3>
          <p>{synopsis.abstract}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Problem Statement
          </h3>
          <p>{synopsis.problem_statement}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Objectives
          </h3>

          <ul className="list-disc list-inside">
            {synopsis.objectives?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Scope
          </h3>
          <p>{synopsis.scope}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Existing System
          </h3>
          <p>{synopsis.existing_system}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Proposed System
          </h3>
          <p>{synopsis.proposed_system}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Methodology
          </h3>

          <ul className="list-disc list-inside">
            {synopsis.methodology?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Expected Outcomes
          </h3>

          <ul className="list-disc list-inside">
            {synopsis.expected_outcomes?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            Future Scope
          </h3>
          <p>{synopsis.future_scope}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">
            References
          </h3>

          <ul className="list-disc list-inside">
            {synopsis.references?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default SynopsisSection;