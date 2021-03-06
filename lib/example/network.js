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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
// import { range } from "lodash";
var __1 = require("..");
var Partition = (function (_super) {
    __extends(Partition, _super);
    function Partition(p) {
        var _this = _super.call(this, p) || this;
        _this.invcFlow = function () {
            _this.setState({ flow: (_this.state.flow + 10) % 70 });
        };
        _this.addNode = function () {
            _this.setState({ nodes: [{ name: "node" + _this.state.nodes.length }].concat(_this.state.nodes) });
        };
        _this.selectNode = function (args) {
            console.log("Select Node ", args);
            _this.setState({ selectedNode: args.nodeId });
        };
        _this.state = {
            nodes: [],
            flow: 10,
            selectedNode: null
        };
        return _this;
    }
    Partition.prototype.componentDidMount = function () {
        this.interval1 = setInterval(this.invcFlow, 1000);
    };
    Partition.prototype.componentWillUnmounnt = function () {
        if (this.interval1)
            clearInterval(this.interval1);
    };
    Partition.prototype.render = function () {
        console.log("Rendering network");
        var _a = this.props, animate = _a.animate, width = _a.width, height = _a.height;
        var defaultIcon = "\uf109";
        var topicIcon = "\u2225";
        // const inc = 1, x = 10, y = 10;
        var topicNode = {
            icon: topicIcon,
            iconStyle: {
                color: "#d8d8d8",
                fontSize: 14
            },
        };
        var edgeStyle = {
            ratePerSecond: Math.abs(this.state.flow - 47),
            particleStyle: { size: 5 }
        };
        return React.createElement("div", { key: "root", style: { display: "flex", flexDirection: "column", alignItems: "stretch", backgroundColor: "black", height: height || 200, width: width || 200, overflow: "hidden" } },
            React.createElement(__1.EdgeFlowDag, { key: "edgeflow", style: { height: (height || 200), width: (width || 200), backgroundColor: "transparent" }, animate: animate, selectedNodeId: this.state.selectedNode, pathStyle: { width: 6, opacity: 0.1, color: "blue" }, iconStyle: {
                    color: "#efefef",
                    fontSize: 18
                }, labelStyle: {
                    color: "#d0d0c0"
                }, nodeStyle: {
                    width: 20,
                    height: 10
                }, particleStyle: {
                    variationMax: 0.05,
                    variationMin: -0.05,
                    roundness: 0.6,
                    size: 2,
                    endingColor: "rgb(128,128,255)",
                    color: "#ffff90"
                }, onClickNode: this.selectNode }, [
                React.createElement(__1.NodeDag, { key: "source", id: "source", icon: defaultIcon, label: "source events" },
                    React.createElement(__1.EdgeDag, __assign({ key: "11E", linkTo: "connector1" }, edgeStyle)),
                    React.createElement(__1.EdgeDag, __assign({ key: "12E", linkTo: "connector2" }, edgeStyle)),
                    React.createElement(__1.EdgeDag, __assign({ key: "13E", linkTo: "connector3" }, edgeStyle))),
                React.createElement(__1.NodeDag, __assign({ key: "connector1", id: "connector1" }, topicNode, { label: "topic 1" }),
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "connector11" }, edgeStyle))),
                React.createElement(__1.NodeDag, __assign({ key: "connector2", id: "connector2" }, topicNode, { label: "topic 2" }),
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "connector23" }, edgeStyle))),
                React.createElement(__1.NodeDag, __assign({ key: "connector3", id: "connector3" }, topicNode, { label: "topic 3" }),
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "connector13" }, edgeStyle))),
                React.createElement(__1.NodeDag, __assign({ key: "connector11", id: "connector11" }, topicNode, { label: "topic 4" }),
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "target" }, edgeStyle))),
                React.createElement(__1.NodeDag, __assign({ key: "connector12", id: "connector12" }, topicNode, { label: "topic 5" }),
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "target" }, edgeStyle))),
                React.createElement(__1.NodeDag, __assign({ key: "connector13", id: "connector13" }, topicNode), this.state.nodes
                    .filter(function (n, i) { return ((n && i) % 2) == 1; })
                    .map(function (n, i) { return React.createElement(__1.EdgeDag, __assign({ linkTo: n && "node" + i, key: "node" + i }, edgeStyle)); }).concat([
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "connector23" }, edgeStyle))
                ])),
                React.createElement(__1.NodeDag, __assign({ key: "connector23", id: "connector23" }, topicNode),
                    React.createElement(__1.EdgeDag, __assign({ key: "21E", linkTo: "target" }, edgeStyle)))
            ].concat(this.state.nodes.map(function (n, i) { return React.createElement(__1.NodeDag, __assign({ key: n && "node" + i, id: "node" + i }, topicNode, { label: "topic " + (i + 8) }),
                React.createElement(__1.EdgeDag, __assign({ linkTo: (i % 2) ? "target" : "connector23" }, edgeStyle))); }), [
                React.createElement(__1.NodeDag, { key: "target", id: "target", icon: defaultIcon, label: "target" })
            ])),
            React.createElement("div", { key: "tool", style: { position: "absolute", right: 5, top: 5 } },
                React.createElement("button", { onClick: this.addNode }, "Add Node")));
    };
    return Partition;
}(React.PureComponent));
exports.default = Partition;
//# sourceMappingURL=network.js.map