import Image from "next/image";

const Header = () => {
  return (
    <div className="nav-bar w-nav">
      <div className="wrapper nav-bar-wrapper">
        <a href="#" rel="noopener noreferrer" className="brand w-nav-brand">
          <Image
            src="/icon.png"
            alt=""
            className="logo-icon"
            width={10}
            height={10}
          />
          <div className="logo-text">OnePanel</div>
        </a>
        <div className="navigation">
          <div className="nav-right">
            <div className="w-layout-grid nav-buttons">
              <a
                href="https://github.com/OnePanelOrg/LandingPage"
                target="_blank"
                rel="noopener noreferrer"
                className="button small white w-button"
              >
                {" "}
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
