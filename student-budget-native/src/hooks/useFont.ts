import {
  useFonts,
  MPLUSRounded1c_400Regular,
  MPLUSRounded1c_500Medium,
  MPLUSRounded1c_700Bold,
} from '@expo-google-fonts/m-plus-rounded-1c';

export const useFont = () => {
  const [fontsLoaded, fontError] = useFonts({
    'MPLUSRounded1c-Regular': MPLUSRounded1c_400Regular,
    'MPLUSRounded1c-Medium': MPLUSRounded1c_500Medium,
    'MPLUSRounded1c-Bold': MPLUSRounded1c_700Bold,
  });

  return fontsLoaded && !fontError;
};