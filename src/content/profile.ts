/** Career entries, newest first. Copy lives in `profile.json` under `career.<id>`. */
export interface CareerEntry {
  id:
    'puffer' | 'reneverse' | 'cryptotoday' | 'cs-computer-systems' | 'mps-data';
  from: string;
  /** End month; omitted while the role is current ("Present"). */
  to?: string;
  stack: readonly string[];
}

export const career: readonly CareerEntry[] = [
  {
    id: 'puffer',
    from: '07/2025',
    stack: [
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'Redis',
      'LLMs',
      'viem',
      'Rust',
    ],
  },
  {
    id: 'reneverse',
    from: '07/2024',
    to: '07/2025',
    stack: ['Node.js', 'GraphQL', 'PostgreSQL', 'AWS', 'Solidity', 'Next.js'],
  },
  {
    id: 'cryptotoday',
    from: '01/2024',
    to: '07/2024',
    stack: ['TypeScript', 'Express', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    id: 'cs-computer-systems',
    from: '10/2022',
    to: '07/2024',
    stack: [
      'React',
      'React Native',
      'd3.js',
      'Hyperledger Fabric',
      'Go',
      'Solidity',
    ],
  },
  { id: 'mps-data', from: '06/2022', to: '01/2023', stack: [] },
];

/** Skill groups; group names live in `profile.json` under `skills.<id>`. */
export interface SkillGroup {
  id: 'frontend' | 'web3' | 'backend' | 'ai' | 'quality';
  items: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    id: 'frontend',
    items: [
      'TypeScript',
      'React',
      'Next.js',
      'React Native',
      'Vite',
      'SCSS',
      'd3.js',
      'three.js',
    ],
  },
  {
    id: 'backend',
    items: [
      'Node.js',
      'Express',
      'GraphQL',
      'PostgreSQL',
      'Redis',
      'AWS',
      'Docker',
      'Go',
      'Rust',
    ],
  },
  {
    id: 'ai',
    items: [
      'LLM tool calling',
      'RAG',
      'Vector embeddings',
      'MCP',
      'Prompt-injection defence',
      'Red-teaming',
    ],
  },
  {
    id: 'quality',
    items: [
      'Vitest',
      'Jest',
      'Playwright',
      'axe',
      'Lighthouse',
      'GitHub Actions',
    ],
  },
  {
    id: 'web3',
    items: [
      'Solidity',
      'viem',
      'wagmi',
      'ethers.js',
      'Hardhat',
      'Hyperledger Fabric',
      'Hyperledger Besu',
    ],
  },
];
