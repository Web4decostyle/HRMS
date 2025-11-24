import fs from "fs";
import path from "path";

export function getPimScreens() {
  const pimPath = path.join(__dirname, "..", "modules", "pim");

  const screens: string[] = [];

  const folders = fs.readdirSync(pimPath);

  folders.forEach((folder) => {
    const screenName = folder
      .replace(/([A-Z])/g, " $1")
      .replace(/-/g, " ")
      .trim();

    screens.push(
      screenName
        .replace(/^./, (c) => c.toUpperCase())
        .replace(" Page", "")
    );
  });

  return screens;
}
