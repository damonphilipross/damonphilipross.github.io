import Project from "../../Components/Project";
import { useState } from "react";
import ModalComponent from "../../Components/ModalComponent";

const ProjectsContainer = ({ posts }) => {
  const [project, setProject] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }
  return (
    <div className="bg-[#EAE8FF] pb-5">
      {posts.map((project, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              setIsOpen(true);
              console.log(`isopen ${isOpen}`)
              setProject(project);
            }}
          >
            <Project projectPosts={project} />
          </div>
        );
      })}
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
