import chroma from "chroma-js";
import { prominent } from 'color.js'

export async function getPalette(url = "") {
    if (!url || url === "") {
        return generatePalette();
    }
    const finalUrl = `${url}`;
    try {
        const color = await prominent(finalUrl, { amount: 1, format: 'hex'});
        console.log(color)
        return generatePalette(color);
    } catch (error) {
        console.error(error);
        return generatePalette();
    }
}

function generatePalette(accentColor = "#ff5722", contrastLevel = "AA") {
  console.log(accentColor);
  // Ensure accentColor is a chroma color
  const baseColor = chroma(accentColor);

  // Define the palette with background and text colors
  return {
    accentColor: baseColor.hex(),
    pageBackground: {
      color: getContrastedColor(baseColor, 0.95).hex(),
      textColor: getAccessibleTextColor(getContrastedColor(baseColor, 0.95)),
    },
    button: {
      color: baseColor.hex(),
      textColor: getAccessibleTextColor(baseColor),
    },
    progressBar: {
      color: baseColor.hex(),
      textColor: getAccessibleTextColor(baseColor),
    },
    rightPanelBackground: {
      color: getContrastedColor(baseColor, 0.9).hex(),
      textColor: getAccessibleTextColor(
        getContrastedColor(baseColor, 0.9),
        contrastLevel
      ),
    },
    makeDonationPanelBackground: {
      color: getContrastedColor(baseColor, 0.95).hex(),
      textColor: getAccessibleTextColor(
        getContrastedColor(baseColor, 0.95),
        contrastLevel
      ),
    },
    unselectedAmount: {
      color: getContrastedColor(baseColor, 0.98).hex(),
      textColor: getAccessibleTextColor(
        getContrastedColor(baseColor, 0.98),
        contrastLevel
      ),
    },
    selectedAmount: {
      color: getContrastedColor(baseColor, 0.75).hex(),
      textColor: getAccessibleTextColor(
        getContrastedColor(baseColor, 0.75),
        contrastLevel
      ),
    },
  };
}

// Helper function to generate a contrasting color that meets the specified contrast ratio
function getAccessibleTextColor(backgroundColor, contrastLevel) {
  const minContrastRatio = contrastLevel === "AAA" ? 7 : 4.5;
  let textColor = chroma(backgroundColor).darken(3); // Start with a darker shade
  while (chroma.contrast(backgroundColor, textColor) < minContrastRatio) {
    textColor = textColor.darken(0.1); // Gradually darken until the contrast ratio is met
  }
  return textColor.hex();
}

// Helper function to get lighter/darker shades based on target luminance
function getContrastedColor(color, targetLuminance) {
  return chroma(color).luminance(targetLuminance);
}
