import Project from "../../Components/Project";
import { useState } from "react";
import ModalComponent from "../../Components/ModalComponent";
import projectJson from "../../Projects/projectsJson";
const ProjectsContainer = () => {
  const [project, setProject] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div className="bg-[#EAE8FF] pb-5">
      {projectJson.map((project) => {
        return (
          <div
            onClick={() => {
              setIsOpen(true);
              setProject(project);
            }}
          >
            <Project key={project.id} projectJson={project} />
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
