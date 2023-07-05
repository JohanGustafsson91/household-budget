const BREAKPOINTS = ["40em", "52em", "64em"];
const FONT_SIZES = [12, 14, 16, 20, 24, 32, 48, 64, 72];
const SPACES = [0, 4, 8, 16, 32, 64, 128, 256, 512];

export const breakpoint = (index: 0 | 1 | 2) =>
  `@media screen and (min-width: ${BREAKPOINTS[index]})`;

export const fontSize = (index: SizeArg) => (FONT_SIZES[index] ?? index) + "px";

type SizeArg = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const shortenedCssKeyMap: Record<keyof Props, Array<string>> = {
  m: ["margin"],
  mt: ["margin-top"],
  mr: ["margin-right"],
  mb: ["margin-bottom"],
  ml: ["margin-left"],
  my: ["margin-top", "margin-bottom"],
  mx: ["margin-left", "margin-right"],
  p: ["padding"],
  pt: ["padding-top"],
  pr: ["padding-right"],
  pb: ["padding-bottom"],
  pl: ["padding-left"],
  py: ["padding-top", "padding-bottom"],
  px: ["padding-left", "padding-right"],
  t: ["top"],
  r: ["right"],
  l: ["left"],
  b: ["bottom"],
};

export function space(values: Props) {
  return Object.keys(values).reduce((acc, key) => {
    const cssKeys = shortenedCssKeyMap[key as keyof typeof shortenedCssKeyMap];
    const value = values[key as keyof typeof shortenedCssKeyMap];
    const parsedValue =
      typeof value === "number" ? `${SPACES[value]}px` : value;
    const cssKeyValue = cssKeys.reduce(
      (a, c) => `${a}${c}: ${parsedValue};\n`,
      ""
    );
    return `${acc}${cssKeyValue}`;
  }, "");
}

type SpaceValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | string;

interface Props {
  m?: SpaceValue;
  mt?: SpaceValue;
  mr?: SpaceValue;
  mb?: SpaceValue;
  ml?: SpaceValue;
  my?: SpaceValue;
  mx?: SpaceValue;
  p?: SpaceValue;
  pt?: SpaceValue;
  pr?: SpaceValue;
  pb?: SpaceValue;
  pl?: SpaceValue;
  py?: SpaceValue;
  px?: SpaceValue;
  t?: SpaceValue;
  r?: SpaceValue;
  l?: SpaceValue;
  b?: SpaceValue;
}
