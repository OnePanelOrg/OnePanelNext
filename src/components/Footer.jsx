const Footer = () => {
  return (
    <footer className="mt-auto bg-[#13aeae] shadow-md">
      <div className="container mx-auto px-4 py-4 text-center text-white">
        <p>&copy; {new Date().getFullYear()} OnePanel Reader.</p>
      </div>
    </footer>
  );
};

export default Footer;
