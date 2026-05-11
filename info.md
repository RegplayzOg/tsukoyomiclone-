# Project Summary: Tsukuyomi Frontend Recreation

## Overview
This project is a high-fidelity frontend recreation of [tsukuyomi.tv](https://tsukuyomi.tv/home), built using **Next.js (App Router)** and **Tailwind CSS**. The goal was to mirror the original site's "dark/underground" aesthetic, cinematic spotlight effects, and grid-based anime content layout, while transitioning from a hybrid CSS approach to a pure Tailwind-native implementation.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Pure utility-first approach)
- **Animations:** Framer Motion
- **Data Source:** AniList GraphQL API (real-time trending data)
- **Icons:** Lucide React

## Project Structure
- `src/app/`: Main application routing, layout, and global styles.
- `src/components/`: Modular components including `Spotlight`, `AnimeGrid`, `AnimeCard`, `Navbar`, and `Footer`.
- `src/lib/`: AniList API service, mock data, and utility functions.
- `public/`: Assets copied from the original site's scraped clone (logos, branding).

## Key Features
- **Spotlight UI:** A full-screen, cinematic hero section with real-time trending anime, slanted CTA buttons, and a visually distinct poster placement that mirrors the source site.
- **Data Integration:** Dynamically fetches trending anime from AniList, including metadata like scores, genres, and airing status.
- **Responsive Design:** A grid-based layout that maintains visual fidelity from mobile to desktop.
- **Badge System:** High-precision styling for 'Live', 'Sub/Dub', and score badges as requested in visual references.

## Backup
A project backup has been created in `animedesign_backup.tar.gz` (excluding `node_modules`, `.next`, and `websiteclone`).
