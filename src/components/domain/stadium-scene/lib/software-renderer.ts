/** GPU names browsers report when WebGL runs on the CPU. */
const SOFTWARE_RENDERERS =
  /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

/** True when `rendererName` (WEBGL_debug_renderer_info) is a CPU fallback. */
export const isSoftwareRenderer = (rendererName: string | null): boolean =>
  rendererName !== null && SOFTWARE_RENDERERS.test(rendererName);

/** The unmasked GPU name of a WebGL context, when the browser exposes it. */
export const rendererNameOf = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): string | null => {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  if (!info) return null;
  const name: unknown = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
  return typeof name === 'string' ? name : null;
};
