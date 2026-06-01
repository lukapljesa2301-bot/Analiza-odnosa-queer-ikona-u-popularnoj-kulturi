export interface QueerIcon {
  id: string;
  name: string;
  category: "Music" | "Activism" | "Drag" | "Art" | "Film/TV" | "Literature & Theory" | "Performance Art";
  description: string;
  decade: number; // e.g. 1960, 1970, 2010
  sentimentScore: number; // -1 to 1 (media portrayal analysis)
  connections: {
    targetId: string;
    reason: string;
    strength: number; // 0.1 to 1.0 (intensity of influence/collaboration)
  }[];
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: string;
  description: string;
  decade: number;
  sentimentScore: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  reason: string;
  strength: number;
}
