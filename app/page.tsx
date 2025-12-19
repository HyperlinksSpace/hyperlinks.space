import { readFile } from "node:fs/promises";
import path from "node:path";
import AnimatedGrid from "./components/AnimatedGrid";
import AnimatedCell from "./components/AnimatedCell";

function parseLinksFile(fileContents: string): string[] {
  // Expected format (one per line): `1. https://example.com/`
  return fileContents
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

export default async function Home() {
  const linksPath = path.join(
    process.cwd(),
    "public",
    "hyperlinks",
    "links.txt",
  );

  const linksTxt = await readFile(linksPath, "utf8");
  const links = parseLinksFile(linksTxt);

  // Read SVG files and parse them
  const cells = await Promise.all(
    [1, 2, 3, 4].map(async (n) => {
      const svgPath = path.join(
        process.cwd(),
        "public",
        "hyperlinks",
        `${n}.svg`,
      );
      const svgContent = await readFile(svgPath, "utf8");
      return {
        n,
        href: links[n - 1] ?? "#",
        svgContent,
      };
    })
  );

  return (
    <AnimatedGrid>
      {cells.map(({ n, href, svgContent }) => (
        <AnimatedCell
          key={n}
          n={n}
          href={href}
          svgContent={svgContent}
        />
      ))}
    </AnimatedGrid>
  );
}
