export interface QueerIcon {
  id: string;
  name: string;
  category: "Music" | "Activism" | "Drag" | "Art" | "Film/TV";
  description: string;
  connections: {
    targetId: string;
    reason: string;
  }[];
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  reason: string;
}
