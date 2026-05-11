import { getAiringSchedule } from "@/lib/anilist";
import ScheduleClient from "./ScheduleClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Airing Schedule | RzDev",
  description: "Keep track of your favorite anime airing schedule and never miss an episode.",
};

export default async function SchedulePage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000;
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime() / 1000;

  // Fetch today's schedule
  const todayPage = await getAiringSchedule(Math.floor(startOfToday), Math.floor(endOfToday));
  const initialSchedule = todayPage?.airingSchedules || [];

  // Fetch recently released (last 48 hours to now)
  const fortyEightHoursAgo = (now.getTime() - (48 * 60 * 60 * 1000)) / 1000;
  const recentlyReleasedPage = await getAiringSchedule(Math.floor(fortyEightHoursAgo), Math.floor(now.getTime() / 1000));
  
  // Group by media and get the latest episode for each anime in the last 48h
  const uniqueMedia = new Map();
  if (recentlyReleasedPage?.airingSchedules) {
    // Reverse to get most recent first
    [...recentlyReleasedPage.airingSchedules].reverse().forEach((item: { media: { id: number }; episode: number }) => {
      if (!uniqueMedia.has(item.media.id)) {
        uniqueMedia.set(item.media.id, {
          ...item.media,
          latestEpisode: item.episode
        });
      }
    });
  }
  
  const initialRecentlyReleased = Array.from(uniqueMedia.values()).slice(0, 12);

  return (
    <main className="bg-[#0e0c0c] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <ScheduleClient 
          initialSchedule={initialSchedule} 
          initialRecentlyReleased={initialRecentlyReleased} 
        />
      </div>
      <Footer />
    </main>
  );
}
