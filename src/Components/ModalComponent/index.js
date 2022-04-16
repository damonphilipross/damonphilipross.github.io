// import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import ReactMarkdown from "react-markdown";

const ModalComponent = ({ isOpen, setIsOpen, project }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={setIsOpen}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block max-w-xl p-4 my-8 overflow-scroll text-left align-middle transition-all transform bg-white max-h-[70vh] shadow-xl rounded-2xl">
              <div className="flex flex-col">
                {/* <img
                  className=" rounded-xl opacity-95 w-full"
                  src={project.image}
                  alt="logo"
                /> */}
                <div className="p-2">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900"
                  >
                    {project.title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <ReactMarkdown
                      className="prose lg:prose-xl"
                      children={project.description}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalComponent;
