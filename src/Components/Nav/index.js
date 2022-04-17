const Nav = () => {
  return (
    <div className="flex flex-row justify-end p-8 pr-14">
      <div className="hover:bg-slate-100 ease-in-out duration-700 rounded-lg p-2 mr-10">
        <a href="#Projects">Projects</a>
      </div>
      <div className="hover:bg-slate-100 ease-in-out duration-700 rounded-lg p-2 mr-10">
        <a href="#Contact">Contact</a>
      </div>
    </div>
  );
};

export default Nav;
