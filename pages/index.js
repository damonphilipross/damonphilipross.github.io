import Head from "next/head";
import Image from "next/image";
import Nav from "../Components/Nav";
import Hero from "../Components/Hero";
import Project from "../Components/Project";
import Footer from "../Components/Footer";
import ProjectsContainer from "../Container/ProjectsContainer";

import { getSortedPostsData } from "../lib/posts";
import PhotoAnimation from "../Components/Photo";

export async function getStaticProps() {
  const posts = getSortedPostsData();
  return {
    props: {
      posts,
    },
  };
}

export default function Home({ posts }) {
  return (
    <div className="bg-gradient-to-b from-[#EAE8FF] to-[#EAE8FF] animate-backg-sm-animation">
      <Head>
        <title>Damon Ross</title>
        <meta
          name="Homepage for Damon Ross"
          content="Full Stack Developer and general maker of things"
        />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      {/* <PhotoAnimation /> */}
      <Hero />
      <ProjectsContainer posts={posts} />
      <Footer />
    </div>
  );
}
