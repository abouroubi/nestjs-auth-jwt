export function EnumToArray(enumVariable: any): string[] {
  return Object.keys(enumVariable).map(key => enumVariable[key]);
}
