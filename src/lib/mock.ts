export interface Anime {
  id: string;
  title: string;
  image: string;
  banner: string;
  score: string;
  year: string;
  episodes: string;
  studio: string;
  genres: string[];
  synopsis: string;
  type: "SUB" | "DUB" | "SUB & DUB";
  status: "FINISHED" | "AIRING";
}

export const MOCK_ANIME: Anime[] = [
  {
    id: "1",
    title: "That Time I Got Reincarnated as a Slime Season 4",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx172151-a7u6rP6G4A8v.jpg",
    banner: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/172151-6VnK6O5y3S2y.jpg",
    score: "8.7",
    year: "2024",
    episodes: "24",
    studio: "8bit",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    synopsis: "The storm of war has settled, but the world of Rimuru Tempest is as busy as ever. With the establishment of the Jura-Tempest Federation, new challenges arise as they navigate diplomacy with neighboring human kingdoms and ancient demon lords.",
    type: "SUB & DUB",
    status: "AIRING",
  },
  {
    id: "2",
    title: "Chainsaw Man",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-mY7cs99Ki6S9.jpg",
    banner: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-0m2L7L2L2L2L.jpg",
    score: "8.8",
    year: "2022",
    episodes: "12",
    studio: "MAPPA",
    genres: ["Action", "Drama", "Supernatural"],
    synopsis: "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil corpses with Pochita.",
    type: "SUB & DUB",
    status: "FINISHED",
  },
  {
    id: "3",
    title: "Oshi no Ko",
    image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-6VnK6O5y3S2y.jpg",
    banner: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/150672-6VnK6O5y3S2y.jpg",
    score: "9.0",
    year: "2023",
    episodes: "11",
    studio: "Doga Kobo",
    genres: ["Drama", "Supernatural"],
    synopsis: "Dr. Goro is reborn as the son of the young starlet Ai Hoshino after her clueless stalker murders him. Now, he wants to help his new mother rise to the top, but what can a child do about the dark underbelly of the entertainment industry?",
    type: "SUB",
    status: "FINISHED",
  }
];
