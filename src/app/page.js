'use client'

import Image from "next/image";
import { getMenu } from "../../services/menuService.js";
import { useState, useEffect } from "react";

export default function Home() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getMenu();
      setMenu(data);
    }
    fetchData();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1>Daftar Menu</h1>
        <ul>
          {menu?.map((item) => (
            <div key={item.id_menu}>
              <Image
                src={item.url_gambar}
                alt={item.nama_menu}
                width={180}
                height={38}
                priority
              />
              <li>
                {item.nama_menu} - Rp {item.harga}
              </li>
            </div>
          ))}
        </ul>
      </main>
    </div>
  );
}
