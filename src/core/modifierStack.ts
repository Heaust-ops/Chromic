export const changeModifier = (
  mS: ModifierStack,
  id: string,
  key: string,
  value: number | [number, number]
) => {
  for (let i = 0; i < mS.length; i++) {
    if (mS[i].id !== id) continue;
    if (mS[i].config[key as never] === undefined)
      throw new Error("unknown property referenced");
    mS[i].config[key as never] = value as Modifier[never];
    break;
  }
};
