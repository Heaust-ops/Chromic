export const DefaultModifierStack: ModifierStack = [
    // Adjust Modifiers
    {
      id: "uninitiated",
      name: "Hue/Saturation",
      needsUpdate: false,
      config: { hue: 0, saturation: 0 },
    },
    {
      id: "uninitiated",
      name: "Brightness/Contrast",
      needsUpdate: false,
      config: { brightness: 0, contrast: 0 },
    },
    {
      id: "uninitiated",
      name: "Vibrance",
      needsUpdate: false,
      config: { amount: 0 },
    },
    {
      id: "uninitiated",
      name: "Denoise",
      needsUpdate: false,
      config: { exponent: 0 },
    },
    {
      id: "uninitiated",
      name: "Sharpness",
      needsUpdate: false,
      config: { radius: 0, strength: 0 },
    },
    {
      id: "uninitiated",
      name: "Noise",
      needsUpdate: false,
      config: { amount: 0 },
    },
    {
      id: "uninitiated",
      name: "Sepia",
      needsUpdate: false,
      config: { amount: 0 },
    },
    {
      id: "uninitiated",
      name: "Vignette",
      needsUpdate: false,
      config: { size: 0, amount: 0 },
    },
    // Blur Modifiers
    {
      id: "uninitiated",
      name: "Triangle Blur",
      needsUpdate: false,
      config: { radius: 0 },
    },
    {
      id: "uninitiated",
      name: "Zoom Blur",
      needsUpdate: false,
      config: { strength: 0, cursorAt: [0, 0] },
    },
    {
      id: "uninitiated",
      name: "Tilt Shift Blur",
      needsUpdate: false,
      config: { cursorAt: [0, 0], angle: 0, blurRadius: 0, gradientRadius: 0 },
    },
    {
      id: "uninitiated",
      name: "Lens Blur",
      needsUpdate: false,
      config: { radius: 0, brightness: 0, angle: 0 },
    },
    // Warp Modifiers
    {
      id: "uninitiated",
      name: "Swirl",
      needsUpdate: false,
      config: { cursorAt: [0, 0], angle: 0, radius: 0 },
    },
    {
      id: "uninitiated",
      name: "Bulge/Pinch",
      needsUpdate: false,
      config: { cursorAt: [0, 0], strength: 0, radius: 0 },
    },
    {
      id: "uninitiated",
      name: "Perspective",
      needsUpdate: false,
      config: {
        cursorsAt: {
          topLeft: [0, 0],
          topRight: [0, 0],
          bottomLeft: [0, 0],
          bottomRight: [0, 0],
        },
      },
    },
  ];