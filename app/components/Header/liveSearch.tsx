import { Product } from "@/types/product";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const LiveSearch = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const timer = useRef<NodeJS.Timeout>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);

    setLoading(true);

    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

        const data: Product[] = await res.json();
        setResults(data);
      } catch (eror) {
        console.error(eror);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  useEffect(() => {
    function HandleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setResults([]);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", HandleClickOutside);
    return () => {
      document.addEventListener("mousedown", HandleClickOutside);
    };
  }, []);
  return (
    <div className="relative w-full flex justify-center mt-4">
      <div className="w-full max-w-xl relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Products..."
          className="w-full p-2 text-base border border-gray-300 rounded-md"
        />

        {query.trim() !== "" && (
          <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 p-4">
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : results.length === 0 ? (
              <div className="text-center text-gray-400">No results</div>
            ) : (
              <ul className="space-y-2">
                {results.map((item) => (
                  <li
                    key={item._id}
                    className="p-2 border-b border-gray-200 hover:bg-gray-100 rounded-md"
                  >
                    <Link
                      href={`/products/${item._id}`}
                      className="flex flex-row items-center space-x-3"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      )}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSearch;
