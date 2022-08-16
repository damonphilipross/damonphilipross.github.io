const Footer = () => {
  return (
    <>
      <h1 className="text-center text-xl pt-8">Contact</h1>
      <div className="pb-10 pt-2 px-10 flex flex-row justify-center">
        <div
          className="text-center p-2 hover:bg-slate-100 ease-in-out duration-700 rounded-lg"
          id="#Contact"
        >
          <a className="" href="https://twitter.com/dampwr1">
            Twitter
          </a>
        </div>
        <div
          className="text-center p-2 hover:bg-slate-100 ease-in-out duration-700 rounded-lg"
          id="#Contact"
        >
          <a className="" href="https://github.com/damonphilipross">
            Github
          </a>
        </div>
        <div
          className="text-center p-2 hover:bg-slate-100 ease-in-out duration-700"
          id="#Contact"
        >
          <p>damonphilipross at gmail dot com</p>
        </div>
      </div>
    </>
  );
};

export default Footer;
