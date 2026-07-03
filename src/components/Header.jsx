import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-[#64de9f] shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-white">
          OnePanel Reader
        </Link>
      </div>
    </header>
  );
};

export default Header;
