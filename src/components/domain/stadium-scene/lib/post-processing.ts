/* eslint-disable import-x/extensions -- three only exports its addons under their .js file names */
import {
  HalfFloatType,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type Scene,
  type WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export interface PostProcessing {
  render(seconds: number): void;
  setSize(width: number, height: number, pixelRatio: number): void;
  setBloom(strength: number): void;
  dispose(): void;
}

/**
 * Zeroes NaN and infinite pixels before the bloom. One bad pixel (a GPU's
 * pow() or bump-map edge case) would otherwise blur over the whole frame and
 * turn it black.
 */
const FiniteOnly = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      bool bad = any(isnan(color)) || any(isinf(color)) || any(notEqual(color, color));
      gl_FragColor = bad ? vec4(0.0, 0.0, 0.0, 1.0) : max(color, vec4(0.0));
    }`,
};

/** Broadcast look on the final image: gentle S-curve, vignette and fine sensor grain. */
const BroadcastGrade = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec3 color = texture2D(tDiffuse, vUv).rgb;
      color = mix(color, color * color * (3.0 - 2.0 * color), 0.18);
      vec2 centred = vUv - 0.5;
      color *= 1.0 - dot(centred, centred) * 0.55;
      float grain = fract(sin(dot(vUv * 913.7 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain - 0.5) * 0.025;
      gl_FragColor = vec4(color, 1.0);
    }`,
};

/**
 * Render (with MSAA) → drop non-finite pixels → bloom on the bright parts (lamps, LED boards, screens)
 * → output pass (ACES tone mapping, sRGB) → broadcast grade.
 */
export const createPostProcessing = (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  { samples }: { samples: number },
): PostProcessing => {
  const composer = new EffectComposer(
    renderer,
    new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples }),
  );
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.4, 0.45, 0.95);
  const grade = new ShaderPass(BroadcastGrade);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(FiniteOnly));
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(grade);

  return {
    render: (seconds) => {
      const time = grade.uniforms.uTime;
      if (time) time.value = seconds % 100;
      composer.render();
    },
    setSize: (width, height, pixelRatio) => {
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);
    },
    setBloom: (strength) => {
      bloom.strength = strength;
    },
    dispose: () => composer.dispose(),
  };
};
