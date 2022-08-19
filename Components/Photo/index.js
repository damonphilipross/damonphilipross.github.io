import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import bare from "../../public/work/barecremation1.png";
import easier from "../../public/work/easier.jpg";
import easier1 from "../../public/work/easier2.jpg";
import easier2 from "../../public/work/easier3.jpg";
import hireroom from "../../public/work/hireroom.png";
import wagieDao from "../../public/work/wagiedao.png";
import wagieDao2 from "../../public/work/wagiedao2.png";
import wagieDao3 from "../../public/work/wagiedao3.png";
import workbot from "../../public/work/workbot.png";

const photos = [
  bare,
  // easier,
  easier1,
  easier2,
  hireroom,
  wagieDao,
  wagieDao2,
  wagieDao3,
  workbot,
];

const PhotoAnimation = () => {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const select = (e, index) => {
    setCurrentPhoto(index);
  };

  const next = () => {
    if (currentPhoto === photos.length - 1) {
      setCurrentPhoto(0);
    } else {
      setCurrentPhoto(currentPhoto + 1);
    }
  };

  const previous = () => {
    if (currentPhoto === 0) {
      setCurrentPhoto(photos.length - 1);
    } else {
      setCurrentPhoto(currentPhoto - 1);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="rounded-xl relative m-auto h-80 w-[100%] md:w-[80%]">
        <Image
          className="rounded-xl"
          src={photos[currentPhoto]}
          alt="fairwork"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="flex flex-row flex-wrap m-auto md:px-36 justify-around pt-4">
        {photos.map((photo, index) => {
          return (
            <div
              key={index}
              className={`m-2 ${
                index === currentPhoto ? "border-teal-700 border-2" : ""
              }`}
              onClick={(e) => select(e, index)}
            >
              <Image src={photo} alt="" height={"64px"} width={"64px"} />
            </div>
          );
        })}
      </div>
      <div className="text-center m-4">
        <button className="p-4" onClick={previous}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button className="p-4" onClick={next}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default PhotoAnimation;
