export const getCategories = async () => {
    return categories;
}

const categories = [
    {
        "name": "EthereumCoreContributions",
        "description": "Ethereum infrastructure which supports, or is a dependency, of the OP Stack.",
        "examples": [
            "Smart contract languages",
            "Ethereum consensus & execution clients",
            "EVM",
            "Ethereum testnets",
            "Cryptography research"
        ],
        "eligibility": {
            "eligible_projects": [
                "Ethereum client implementations",
                "Infrastructure to test and deploy chains",
                "Languages that are dedicated to the development of smart contracts",
                "Research that informs Ethereum core development"
            ],
            "note": "Projects that are used to develop or deploy contracts or apps, including in the development and deployment of Optimism contracts, may be rewarded in Retro Funding 7: Dev Tooling, and are not in scope for this category."
        }
    },
    {
        "name": "OPStackResearchAndDevelopment",
        "description": "Direct research & development contributions to the OP Stack, and contributions that support protocol upgrades",
        "examples": [
            "Optimism Protocol upgrades",
            "OP Stack Client Implementations",
            "modules & mods",
            "audits and Fault Proof VM implementations"
        ],
        "eligibility": {
            "eligible_projects": [
                "Work on core components of the OP Stack, including client implementations, modules, and modifications.",
                "Research or development that introduces new features, improvements, or capabilities to the OP Stack.",
                "Security audits specifically on the OP Stack or its components."
            ],
            "note": "Only Optimism Monorepo contributions by core devs may be rewarded within Retro Funding 5. Commits to the monorepo are currently mainly done by Optimism core devs and the core dev program is not developed enough to support outside contributions to the monorepo yet. As the core dev program evolves, more contributions to the monorepo may become eligible."
        }
    },
    {
        "name": "OPStackTooling",
        "description": "Efforts that improve the usability and accessibility of the OP Stack through tooling enhancements.",
        "examples": [
            "Integration and load testing infrastructure",
            "scripts for running an Optimism node",
            "RaaS providers",
            "OP Stack tutorials & documentation"
        ],
        "eligibility": {
            "eligible_projects": [
                "Tools that facilitate the deployment, operation, or testing of the OP Stack. This includes integration tools, load testing infrastructure, and scripts for node management.",
                "Services for deploying and hosting an OP Chain",
                "Documentation and tutorials which aid in understanding of the OP Stack’s components and its development"
            ]
        }
    }
]