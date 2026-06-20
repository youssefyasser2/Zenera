import HeroSectionPage from "@/components/Home/HeroSection";
import JoinSectionPage from "@/components/Home/JoinSection";
import ProgressCardPage from "@/components/Home/ProgressCard";
import TasksOverviewPage from "@/components/Home/TasksOverview";

const HomePage = () => {
  return (
    <>
      <HeroSectionPage />
      <TasksOverviewPage />
      <ProgressCardPage />
      <JoinSectionPage />
    </>
  );
};

export default HomePage;
