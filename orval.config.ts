import {defineConfig} from 'orval';

export default defineConfig({
    "op-agora": {
        input: 'https://vote.optimism.io/api/v1/spec',
        output: {
            mode: 'split',
            target: './src/__generated__/api/agora.ts',
            mock: true
        },
        hooks: {
            afterAllFilesWrite: 'prettier --write',
        },
    },
});