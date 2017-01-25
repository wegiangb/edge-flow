/// <reference types="react" />
import * as React from "react";
import { Node } from "./flow-node";
export { Node, Edge, INode, IEdge, IEdgeProps, INodeProps } from "./flow-node";
export interface IEvent {
    nodeId: string;
    graph: {
        x: number;
        y: number;
    };
    screen: {
        x: number;
        y: number;
    };
}
export interface IProps {
    text?: string;
    width: number;
    height: number;
    run?: boolean;
    containerStyle?: React.CSSProperties;
    onClickNode?: (args: IEvent) => void;
    backgroundColor?: string;
    selectedNodeId?: string;
    children?: Node[];
}
export interface IState {
}
export declare class EdgeFlow extends React.Component<IProps, IState> {
    constructor(p: IProps);
    render(): JSX.Element;
}
