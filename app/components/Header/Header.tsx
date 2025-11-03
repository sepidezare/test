"use client";
import LiveSearch from "./liveSearch";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <LiveSearch />
      </div>
    </header>
  );
}
