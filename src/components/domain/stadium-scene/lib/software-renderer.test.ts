import { isSoftwareRenderer } from './software-renderer';

describe('isSoftwareRenderer', () => {
  describe('given GPU names browsers report', () => {
    it('when the name is a CPU fallback, then it is treated as software rendering', () => {
      // Given
      const names = [
        'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)',
        'llvmpipe (LLVM 15.0.7, 256 bits)',
        'Microsoft Basic Render Driver',
      ];

      // When
      const results = names.map(isSoftwareRenderer);

      // Then
      expect(results).toEqual([true, true, true]);
    });

    it('when the name is a real GPU or hidden, then the 3D scene may run', () => {
      // Given
      const names = [
        'ANGLE (NVIDIA GeForce RTX 3060 Direct3D11)',
        'Apple M2',
        null,
      ];

      // When
      const results = names.map(isSoftwareRenderer);

      // Then
      expect(results).toEqual([false, false, false]);
    });
  });
});
