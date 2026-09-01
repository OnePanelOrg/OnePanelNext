import type { GetServerSideProps, NextPage } from "next";

const ReaderRedirect: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/",
    permanent: false,
  },
});

export default ReaderRedirect;
