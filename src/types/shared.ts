export type CategoryId =
  | "ETHEREUM_CORE_CONTRIBUTIONS"
  | "OP_STACK_RESEARCH_AND_DEVELOPMENT"
  | "OP_STACK_TOOLING";

export type Round5Allocation = {
  category_slug: CategoryId;
  allocation: number;
  locked: boolean;
};
