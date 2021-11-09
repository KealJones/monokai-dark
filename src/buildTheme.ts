import { Hjson, ColorTheme, TokenColor, map, desaturateHex, isColorTheme, path, Colors } from "../deps.ts";
import config from './buildConfig.ts';

const outputFileLocation = path.join(Deno.cwd(), './themes/monokai-dark-color-theme.json');

let result: ColorTheme = {};

const sources: Record<string, ColorTheme> = {};
for (const name in config.sources) {
  let data;
  const source = config.sources[name];
  if (typeof source == 'string') {
    if (source.includes("http")) {
      const res = await fetch(source);
      data = Hjson.parse(await res.text());
    } else {
      data = Hjson.parse(await Deno.readTextFile(source))
    }
  } else if (isColorTheme(source)) {
    data = source;
  }

  sources[name] = data;
}

config.combine.forEach((pathString) => {
  const path = pathString.split('.');
  const source = path[0];
  const key = path[1] as keyof ColorTheme;
  const sourceTheme = sources[source];
  if (Array.isArray(sourceTheme[key])) {
    if (key == 'tokenColors'){
      const concat = sourceTheme[key] ?? [];
      const current = result[key] ?? [];
      for(const itemIndex in concat) {
        const index = current.findIndex((innerItem) => innerItem.name == concat[itemIndex].name);
        if (index != -1) {
          current[index] = concat[itemIndex];
          concat.splice(parseInt(itemIndex),1)
        }
      }

      result[key] = [
        ...current,
        ...concat
      ];
    } else {
      /// Not sure what this would be but lets just mash them together.
      const current = result[key];
      const concat = sourceTheme[key] as any;
      result[key] = [
        ...(Array.isArray(current) && current as TokenColor[] || []),
        ...concat
      ] as any;
    }
  } else if (typeof sourceTheme[key] == 'object') {
    result[key] = Object.assign({}, result[key], sources[source][key]) as any;
  } else {
    result[key] = sources[source][key] as any;
  }
});

for (const _key in config.remove) {
  const key = <keyof ColorTheme>_key;
  const toRemove = config.remove[key];
  const section = result[key];
  if (section != undefined && Array.isArray(section) ) {
    toRemove.forEach((name) => {
      const objectIndex = section.findIndex((item) => item.name == name);
      if (section[objectIndex] && section === result[key]) {
        delete (result[key] as TokenColor[])[objectIndex];
      }
    });

  } else if (typeof result[key] == 'object') {
    (toRemove as Array<string>).forEach(path => {
      delete (result[key] as Record<string, string>)[path];
    });
  }
}

if (config.greyify) {
  result = map(result, (key: string, value: any) => {
    if (typeof value == 'string' && value[0] == '#'){
      if (config.greyify?.keys && config.greyify?.values) {
        if (shouldGreyify(key, ) && shouldGreyifyValue(value)){
          return desaturateHex(value);
        }
      } else if (config.greyify?.keys && shouldGreyifyKey(key)) {
        return desaturateHex(value);
      } else if (config.greyify?.values && shouldGreyifyValue(value)) {
        return desaturateHex(value);
      }
    }
    return value;
  });
}

function shouldGreyify(check: string, checkAgainst?: string[]):boolean {
  const checks: boolean[] = [];
  if (Array.isArray(checkAgainst)) {
    for(const checkValue of checkAgainst) {
      const regexp = new RegExp(checkValue)
      checks.push(regexp.test(check));
    }
  }
  return checks.every((v) => v == true) ? true : false;
}

function shouldGreyifyKey(key: string):boolean { return shouldGreyify(key, config.greyify?.keys); }
function shouldGreyifyValue(key: string):boolean { return shouldGreyify(key, config.greyify?.values); }


await Deno.writeTextFile(outputFileLocation, Hjson.stringify(result, {quotes: "all", separator: true}));

console.info(Colors.blue('Theme Successfully Created!'));
console.log('Check it out here: file://' + outputFileLocation);