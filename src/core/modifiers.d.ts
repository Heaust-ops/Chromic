interface ModifierStackElement {
  id: string;
  name: string;
  needsUpdate: boolean;
  config: Modifier;
}

type ModifierStack = ModifierStackElement[];

/**
 * GENERIC MODIFIERS
 */

type AdjustModifier =
  | HSModifier
  | BCModifier
  | VibranceModifier
  | DenoiseModifier
  | SharpnessModifier
  | NoiseModifier
  | SepiaModifier
  | VignetteModifier
  | ExposureModifier;

type BlurModifier =
  | TriangleBlurModifier
  | ZoomBlurModifier
  | TiltShiftBlurMofifier
  | LensBlurModifier;

type WarpModifier = SwirlModifier | BulgePinchModifier | PerspectiveModifier;

type MetaModifier = ModifierModifier;

type Modifier = AdjustModifier | BlurModifier | WarpModifier | MetaModifier;

/**
 * META MODIFIERS
 */
interface ModifierModifier {
  stack: ModifierStack;
}

/**
 * ADJUST MODIFIERS
 */
interface HSModifier {
  hue: number;
  saturation: number;
}

interface BCModifier {
  brightness: number;
  contrast: number;
}

interface VibranceModifier {
  amount: number;
}

interface ExposureModifier {
  amount: number;
}

interface DenoiseModifier {
  exponent: number;
}

interface SharpnessModifier {
  radius: number;
  strength: number;
}

interface NoiseModifier {
  amount: number;
}

interface SepiaModifier {
  amount: number;
}

interface VignetteModifier {
  size: number;
  amount: number;
}

/**
 * BLUR MODIFIERS
 */

interface ZoomBlurModifier {
  strength: number;
  cursorAt: [number, number];
}

interface TriangleBlurModifier {
  radius: number;
}

interface TiltShiftBlurMofifier {
  cursorAt: [number, number];
  angle: number;
  blurRadius: number;
  gradientRadius: number;
}

interface LensBlurModifier {
  radius: number;
  brightness: number;
  angle: number;
}

/**
 * WARP MODIFIERS
 */

interface SwirlModifier {
  cursorAt: [number, number];
  angle: number;
  radius: number;
}

interface BulgePinchModifier {
  cursorAt: [number, number];
  strength: number;
  radius: number;
}

interface PerspectiveModifier {
  cursorsAt: {
    topLeft: [number, number];
    topRight: [number, number];
    bottomLeft: [number, number];
    bottomRight: [number, number];
  };
}
