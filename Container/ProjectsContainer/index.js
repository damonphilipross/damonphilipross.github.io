import Project from "../../Components/Project";
import { useState } from "react";
import ModalComponent from "../../Components/ModalComponent";

const ProjectsContainer = ({ posts }) => {
  const [project, setProject] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [projectsShown, setProjectsShown] = useState(4);
  const [showMore, setShowMore] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  const showMoreClick = () => {
    setProjectsShown(posts.length);
    setShowMore(true);
  };

  const showLess = () => {
    setProjectsShown(4);
    setShowMore(false);
  };

  return (
    <div className="bg-[#EAE8FF]">
      {posts.slice(0, projectsShown).map((project, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              setIsOpen(true);
              setProject(project);
            }}
          >
            <Project projectPosts={project} />
          </div>
        );
      })}
      <div className="text-center pb-10">
        {!showMore ? (
          <button
            onClick={showMoreClick}
            className="py-4 px-8 rounded-lg border-black border-2 hover:opacity-50 ease-in-out duration-300 hover:scale-105"
          >
            Show more...
          </button>
        ) : (
          <button
            onClick={showLess}
            className="py-4 px-8 rounded-lg border-black border-2 hover:opacity-50 ease-in-out duration-300 hover:scale-105"
          >
            Show less...
          </button>
        )}
      </div>
      {isOpen && (
        <ModalComponent
          isOpen={isOpen}
          closeModal={closeModal}
          setIsOpen={setIsOpen}
          project={project}
        />
      )}
    </div>
  );
};

export default ProjectsContainer;
