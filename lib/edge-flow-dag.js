/*
 * Simple Edge Flow Drawing using Absolute Position of nodes
 * */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var lodash_1 = require("lodash");
// import Color = require("color");
var edge_flow_1 = require("./edge-flow");
var dag_edge_1 = require("./edge-flow-dag/dag-edge");
exports.EdgeDag = dag_edge_1.Edge;
var dag_node_1 = require("./edge-flow-dag/dag-node");
exports.NodeDag = dag_node_1.Node;
var equals = require("equals");
var dagre_helper_1 = require("./edge-flow-dag/dagre-helper");
var common_1 = require("./common");
var EdgeFlowDag = (function (_super) {
    __extends(EdgeFlowDag, _super);
    function EdgeFlowDag(p) {
        var _this = _super.call(this, p) || this;
        _this.state = { nodes: _this.getStateFromProps(p, true) };
        return _this;
    }
    EdgeFlowDag.prototype.getStateFromProps = function (newProps, force) {
        if (force === void 0) { force = false; }
        var newState = common_1.mapChild(newProps.children, function (props) { return ({
            width: props.style && props.style.width || 15,
            height: props.style && props.style.height || 15,
            links: common_1.mapChild(props.children, function (_a) {
                var linkTo = _a.linkTo;
                return ({ linkTo: linkTo });
            })
        }); });
        var oldState = common_1.mapChild(this.props.children, function (props) { return ({
            width: props.style && props.style.width || 15,
            height: props.style && props.style.height || 15,
            links: common_1.mapChild(props.children, function (_a) {
                var linkTo = _a.linkTo;
                return ({ linkTo: linkTo });
            })
        }); });
        if (force || !equals(newState, oldState)) {
            var graph = dagre_helper_1.getGraphFromNodes(newProps.children);
            return dagre_helper_1.getLayout(graph);
        }
        else {
            return this.state.nodes;
        }
    };
    EdgeFlowDag.prototype.componentWillReceiveProps = function (newProps) {
        console.log("new Props");
        if (newProps.children !== this.props.children) {
            this.setState({ nodes: this.getStateFromProps(newProps) });
        }
    };
    EdgeFlowDag.prototype.render = function () {
        var state = this.state;
        var posNodes = lodash_1.keyBy(state.nodes, function (n) { return n.id; });
        var _a = this.props, children = _a.children, props = __rest(_a, ["children"]);
        var nodes = common_1.getChildrenProps(children) || [];
        console.log("Rendering DAG " + nodes.length);
        var nodeDict = lodash_1.keyBy(nodes, function (n) { return n.id; });
        var posEdges = lodash_1.flatten(state.nodes.map(function (n) { return n.edges.map(function (e) { return (__assign({}, e, { id: n.id })); }); }));
        var edgeDict = lodash_1.keyBy(posEdges, function (e) { return e.id + "-" + e.linkTo; });
        var allEdges = nodes.reduce(function (p, node) { return p.concat((common_1.getChildrenProps(node.children))
            .map(function (edge) { return (__assign({ fromForceNode: node.id }, edge)); })); }, []);
        var groupedEdges = lodash_1.groupBy(allEdges, function (e) { return e.fromForceNode; });
        return (React.createElement(edge_flow_1.EdgeFlow, __assign({}, props), nodes.map(function (node) { return (React.createElement(edge_flow_1.Node, __assign({ key: node.id, center: posNodes[node.id] }, node), groupedEdges[node.id] && groupedEdges[node.id]
            .filter(function (edge) { return nodeDict[edge.linkTo]; })
            .map(function (edge) {
            var ee = edgeDict[node.id + "-" + edge.linkTo];
            var fromForceNode = edge.fromForceNode, propse = __rest(edge, ["fromForceNode"]);
            return React.createElement(edge_flow_1.Edge, __assign({ key: edge.fromForceNode + "-" + edge.linkTo }, propse, { p0: ee.p0, p1: ee.p1, p2: ee.p2, p3: ee.p3 }));
        }))); })));
    };
    return EdgeFlowDag;
}(React.PureComponent));
exports.EdgeFlowDag = EdgeFlowDag;
//# sourceMappingURL=edge-flow-dag.js.map