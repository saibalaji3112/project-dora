function TechStackSection({ techStack }) {
  if (!techStack) return null;

  return (
    <div className="mt-10">
      <hr className="border-slate-700 mb-8" />

      <h2 className="text-3xl font-bold text-blue-400 mb-8">
        Recommended Technology Stack
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-blue-300 font-semibold">Frontend</h3>
          <p>{techStack.frontend}</p>
        </div>

        <div>
          <h3 className="text-blue-300 font-semibold">Backend</h3>
          <p>{techStack.backend}</p>
        </div>

        <div>
          <h3 className="text-blue-300 font-semibold">Database</h3>
          <p>{techStack.database}</p>
        </div>

        <div>
          <h3 className="text-blue-300 font-semibold">AI / ML</h3>
          <p>{techStack.ai_ml}</p>
        </div>

        <div>
          <h3 className="text-blue-300 font-semibold">Cloud</h3>
          <p>{techStack.cloud}</p>
        </div>

        <div>
          <h3 className="text-blue-300 font-semibold">Deployment</h3>
          <p>{techStack.deployment}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl text-blue-300 font-semibold mb-2">
          Programming Languages
        </h3>

        <ul className="list-disc list-inside">
          {techStack.programming_languages?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl text-blue-300 font-semibold mb-2">
          Frameworks
        </h3>

        <ul className="list-disc list-inside">
          {techStack.frameworks?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl text-blue-300 font-semibold mb-2">
          Libraries
        </h3>

        <ul className="list-disc list-inside">
          {techStack.libraries?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl text-blue-300 font-semibold mb-2">
          Development Tools
        </h3>

        <ul className="list-disc list-inside">
          {techStack.development_tools?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl text-blue-300 font-semibold mb-2">
          Why This Stack?
        </h3>

        <p>{techStack.why_this_stack}</p>
      </div>
    </div>
  );
}

export default TechStackSection;