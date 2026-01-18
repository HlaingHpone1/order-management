import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function adjustColor(color: string) {
  let colorInt = parseInt(color.slice(1), 16);
  colorInt = (colorInt + 0x111111) & 0xffffff;
  return `#${colorInt.toString(16).padStart(6, "0").toUpperCase()}`;
}

export const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }

  color = adjustColor(color);

  const textColor = getTextColor(color);

  return { bgColor: color, textColor };
};

export const getTextColor = (backgroundColor: string) => {
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#0B1215" : "#E5F4F3";
};
