const Project = ({ projectPosts }) => {
  const trimDescription = (description) => {
    if (description.length > 200) {
      return description.substring(0, 200) + "...";
    }
    return description;
  };

  return (
    <div className="flex flex-col md:flex-row mb-16 mx-14 rounded-xl bg-white shadow-slate-400 shadow-xl hover:scale-105 ease-in-out duration-300 cursor-pointer">
      {/* {projectJson.image (<img
        className="rounded-l-xl opacity-95"
        src={projectJson.image}
        alt="project"
      />)} */}
      <div className="flex flex-col p-6">
        <h1 className="text-[#2D3142] p-2 font-bold">
          {projectPosts["title"]}
        </h1>
        <p className="text-[#2D3142] p-2">
          {trimDescription(projectPosts["content"])}
        </p>
        <div className="flex flex-row flex-wrap">
          {projectPosts["tech"] &&
            projectPosts["tech"].map((tech, index) => {
              return (
                <div
                  key={index}
                  className="border-2 rounded-md border-[#B0D7FF] m-2  hover:scale-105 ease-in-out duration-300"
                >
                  <p className="text-[#2D3142] px-1 py-1">{tech}</p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Project;
