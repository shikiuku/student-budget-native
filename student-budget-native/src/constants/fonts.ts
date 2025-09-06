export const Fonts = {
  // M PLUS Rounded 1c フォントファミリー
  regular: 'MPLUSRounded1c-Regular',
  medium: 'MPLUSRounded1c-Medium',
  bold: 'MPLUSRounded1c-Bold',
} as const;

// フォントウェイト対応表
export const getFontFamily = (weight?: string | number): string => {
  if (!weight) return Fonts.regular;
  
  const weightNum = typeof weight === 'string' ? parseInt(weight) : weight;
  
  if (weightNum >= 700 || weight === 'bold') {
    return Fonts.bold;
  } else if (weightNum >= 500 || weight === '500' || weight === 'medium') {
    return Fonts.medium;
  }
  
  return Fonts.regular;
};