export enum TreeNotificationTypesEnum {
  TREE_INITIALIZATION_SUCCESS,
  TREE_INITIALIZATION_FAILED,
}

export enum SearchByEnum {
  PROBLEM = 'PROBLEM',
  TEXT = 'TEXT',
}

export enum ProblemType {
  NONE,
  MISS_MATCH_PROBLEM,
  NOT_EXIST_ON_EN,
  NOT_EXIST_ON_OTHER_LANG,
}

export class JsonNode {
  id: string;
  key: string;
  value: { [key: string]: string } | JsonNode[];
  hasChildren: boolean;
  fullPath: string;
  maxKeyLength4Level: number;
  problemType = ProblemType.NONE;
  parent: JsonNode;

  children = (): JsonNode[] => this.hasChildren ? this.value as JsonNode[] : null;
}
