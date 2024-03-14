const colors = [
    "#5D4037",
    "#BF360C",
    "#212121",
    "#1B5E20",
    "#33691E",
    "#2E7D32",
    "#01579B",
    "#006064",
    "#004D40",
    "#0277BD",
    "#00695C",
    "#651FFF",
    "#304FFE",
    "#1A237E",
    "#0D47A1",
    "#1976D2",
    "#B71C1C",
    "#D32F2F",
    "#C2185B",
    "#880E4F",
    "#4A148C",
  ];
  
  function shuffleAndPickOne<T>(arr: T[]): T | undefined {
    if (arr.length === 0) {
      return undefined;
    }
    arr.sort(() => Math.random() - 0.5);
    return arr[0];
  }

export const getColor = () => shuffleAndPickOne(colors);