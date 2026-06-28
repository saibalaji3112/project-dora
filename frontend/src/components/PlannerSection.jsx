function PlannerSection({ plan }) {
  if (!plan) return null;

  const renderList = (list) => {
    if (!Array.isArray(list)) return <p>{String(list)}</p>;

    return (
      <ul className="list-disc list-inside space-y-2">
        {list.map((item, index) => {
          if (typeof item === "string") {
            return <li key={index}>{item}</li>;
          }

          if (typeof item === "object" && item !== null) {
            return (
              <li key={index}>
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="ml-2 mb-2">
                    <strong className="capitalize">
                      {key.replace(/_/g, " ")}:
                    </strong>

                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside ml-5 mt-1">
                        {value.map((v, i) => (
                          <li key={i}>{String(v)}</li>
                        ))}
                      </ul>
                    ) : typeof value === "object" && value !== null ? (
                      <pre className="bg-slate-900 p-3 rounded mt-1 overflow-x-auto text-sm">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span> {String(value)}</span>
                    )}
                  </div>
                ))}
              </li>
            );
          }

          return <li key={index}>{String(item)}</li>;
        })}
      </ul>
    );
  };

  const renderObject = (obj) => {
    if (!obj) return null;

    if (typeof obj === "string") return <p>{obj}</p>;

    return (
      <div className="space-y-4">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key}>
            <h4 className="font-semibold text-orange-200 capitalize mb-1">
              {key.replace(/_/g, " ")}
            </h4>

            {Array.isArray(value) ? (
              renderList(value)
            ) : typeof value === "object" && value !== null ? (
              renderObject(value)
            ) : (
              <p>{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-10">
      <hr className="border-slate-700 mb-8" />

      <h2 className="text-3xl font-bold text-orange-400 mb-8">
        AI Project Development Plan
      </h2>

      <div className="space-y-10">

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            System Architecture
          </h3>
          {renderObject(plan.system_architecture)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Folder Structure
          </h3>
          {renderList(plan.folder_structure)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Database Design
          </h3>
          {renderObject(plan.database_design)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            APIs Required
          </h3>
          {renderList(plan.apis_required)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Weekly Plan
          </h3>
          {renderList(plan.weekly_plan)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Milestones
          </h3>
          {renderList(plan.milestones)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Estimated Cost
          </h3>
          {renderObject(plan.estimated_cost)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Software Requirements
          </h3>
          {renderList(plan.software_requirements)}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-orange-300 mb-3">
            Hardware Requirements
          </h3>
          {renderList(plan.hardware_requirements)}
        </div>

      </div>
    </div>
  );
}

export default PlannerSection;