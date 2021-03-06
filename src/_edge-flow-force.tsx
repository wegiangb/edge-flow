/* 
 * Simple Edge Flow Drawing using Absolute Position of nodes
 * */

import * as React from "react";
import { groupBy, keyBy } from "lodash";


import { EdgeFlow, Edge, Node,  IBaseProps } from "./edge-flow"
import { Edge as EdgeForce, IEdgeForceProps } from "./edge-flow-force/force-edge";
import { Node as NodeForce, INodeForceProps } from "./edge-flow-force/force-node";
import { getChildrenProps} from "./common"

export { EdgeForce, IEdgeForceProps, NodeForce, INodeForceProps };

import { getGraphFromNodes, getLayout,  IPosNode} from "./edge-flow-force/ngraph-helper"


export interface IProps extends IBaseProps {
    children?: NodeForce[];
}

export interface IState {
    nodes?: IPosNode[];
}

// const styles = {
//     container: {
//         position: "relative",
//         display: "inline-block",
//         verticalAlign: "top",
//         padding: 0,
//         margin: 0
//     } as React.CSSProperties
// }

export class EdgeFlowForce extends React.Component<IProps, IState> {

    constructor(p: IProps) {
        super(p);
        this.state = { nodes:this.getStateFromProps(p) };
    }

    private getStateFromProps(newProps: IProps): IPosNode[] {
        const graph = getGraphFromNodes(newProps.children as any);
        return getLayout(graph, newProps.children as any);
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({nodes:this.getStateFromProps(newProps)});
    }

    public render() {
        const state = this.state;
        const posNodes = keyBy(state.nodes, n => n.id);
        const {children, ...props} = this.props;
        const nodes = getChildrenProps<INodeForceProps>(children) || [];
        // const nodeDict = keyBy(nodes, n => n.id);
        type EdgeAndNodeType = IEdgeForceProps & { fromForceNode: string };
        const allEdges = nodes.reduce((p, node) => [
            ...p,
            ...(getChildrenProps<IEdgeForceProps>(node.children))
                .filter(edge => !isNaN(edge.ratePerSecond) && (edge.ratePerSecond > 0))
                .map(edge => ({ fromForceNode: node.id, ...edge } as EdgeAndNodeType))
        ], [] as EdgeAndNodeType[]);
        const groupedEdges = groupBy(allEdges, e => e.fromForceNode);
        return (<EdgeFlow {...props}>
            {
                nodes.map(node => <Node key={node.id} center={posNodes[node.id]} {...node} >
                    {groupedEdges[node.id] && groupedEdges[node.id].map(edge => <Edge key={edge.fromForceNode + "-" + edge.linkTo} {...edge} />)}
                </Node>)
            }
        </EdgeFlow>
        );
    }
}

