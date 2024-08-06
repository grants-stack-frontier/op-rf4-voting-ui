import { defineConfig } from 'orval';

export default defineConfig({
    "op-agora": {
        input: 'https://vote.optimism.io/api/v1/spec',
        output: './src/__generated__/api/agora.ts',
        hooks: {
            afterAllFilesWrite: 'prettier --write',
        },
    },
});