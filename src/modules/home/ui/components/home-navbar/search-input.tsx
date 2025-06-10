"use client"

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constants";
import { SearchIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react"

export const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState("");

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {  // penanganan saat form dikirim
        e.preventDefault(); // mencegah browser reload saat mengirim form

        const url = new URL("/search", APP_URL ? `https://${APP_URL}` : "http://localhost:3000"); // membuat url baru / (window.location.origin) jika url masih local
        const newQuery = value.trim(); // menghapus spasi di awal dan di akhir

        url.searchParams.set("query", encodeURIComponent(newQuery)); // di encode agar aman dari spasi

        if (newQuery === ""){
            url.searchParams.delete("query");
        }

        setValue(newQuery);
        router.push(url.toString()) // contoh /search?query=laptop
    }

    return (
        <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
            <div className="relative w-full">
                <input  
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type="text"
                    placeholder="Search"
                    className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"/>

                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setValue("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                    >
                        <XIcon className="text-gray-500" />
                    </Button>
                )}

            {/* TODO: add remove search button */}
            </div>
            <button 
                disabled={!value.trim()}
                type="submit"
                className="bg-gray-100 px-5 py-2.5 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <SearchIcon className="size-5"/>
            </button>
        </form>
    )
}