import {
  siJavascript,
  siTypescript,
  siReact,
  siNextdotjs,
  siAstro,
  siVuedotjs,
  siNuxt,
  siRedux,
  siMobx,
  siReactquery,
  siCss,
  siSass,
  siTailwindcss,
  siNodedotjs,
  siExpress,
  siMongodb,
  siDocker,
  siAxios,
  siChakraui,
  siAntdesign,
  siHeroui,
  siMui,
  siShadcnui,
  siQuasar,
  siJest,
  siTestinglibrary,
  type SimpleIcon,
} from "simple-icons";

export interface StackItem {
  id: string;
  name: string;
  path?: string;
  monogram?: string;
  brand: string;
}

const isDark = (hex: string) => {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 70;
};

const icon = (name: string, si: SimpleIcon): StackItem => ({
  id: si.slug,
  name,
  path: si.path,
  brand: isDark(si.hex) ? "#ffffff" : `#${si.hex}`,
});

const mono = (id: string, name: string, monogram: string, brand: string): StackItem => ({
  id,
  name,
  monogram,
  brand,
});

export const stackRows: StackItem[][] = [
  [
    icon("JavaScript", siJavascript),
    icon("TypeScript", siTypescript),
    icon("React.js", siReact),
    icon("Next.js", siNextdotjs),
    icon("Astro", siAstro),
    icon("Vue.js", siVuedotjs),
    icon("Nuxt.js", siNuxt),
    icon("Redux Toolkit", siRedux),
    mono("zustand", "Zustand", "Zu", "#d9a066"),
    icon("MobX", siMobx),
    icon("TanStack Query", siReactquery),
    { ...icon("RTK Query", siRedux), id: "rtk-query" },
    mono("ky", "Ky", "Ky", "#8ccbd8"),
    icon("CSS", siCss),
    icon("SCSS", siSass),
    icon("Tailwind CSS", siTailwindcss),
  ],
  [
    icon("Node.js", siNodedotjs),
    icon("Express.js", siExpress),
    icon("MongoDB", siMongodb),
    icon("Docker", siDocker),
    icon("Axios", siAxios),
    icon("Chakra UI", siChakraui),
    icon("Ant Design", siAntdesign),
    icon("NextUI", siHeroui),
    icon("Material UI", siMui),
    icon("shadcn/ui", siShadcnui),
    mono("reactbits", "React Bits", "RB", "#a3e635"),
    mono("naiveui", "Naive UI", "N", "#63e2b7"),
    icon("Quasar", siQuasar),
    icon("Jest", siJest),
    icon("React Testing Library", siTestinglibrary),
  ],
];
