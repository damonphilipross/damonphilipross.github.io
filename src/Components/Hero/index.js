const Hero = () => {
  return (
    <div className="md:pt-20 px-20">
      <h1 className="text-6xl font-light text-[#2D3142]">
        Hi, I'm <span className="text-[#2D3142] font-bold">Damon</span>
      </h1>
      <h2 className="text-3xl py-6 font-light text-[#2D3142]">
        I’m a full stack dev, who is focused on making simple, useful products
        and creative art pieces.
      </h2>
      <div className="flex flex-col justify-center text-center text-2xl py-10">
        <h1 id="#Projects" className="">Projects</h1>
        <span className="bg-[#2D3142] rounded-md py-[2px] px-14 m-auto"></span>
      </div>
    </div>
  );
};

export default Hero;
