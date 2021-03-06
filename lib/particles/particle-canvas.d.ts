/// <reference types="react" />
import * as React from "react";
import { IParticleEdge } from './particles';
export declare class ParticleEdge extends React.Component<IParticleEdge, any> {
    render(): any;
}
export interface IProps {
    width: number;
    height: number;
    children?: ParticleEdge[];
    run?: boolean;
    backgroundColor?: string;
}
export declare class ParticleCanvas extends React.PureComponent<IProps, any> {
    private canvas;
    private particles;
    private setupParticles(props);
    componentWillReceiveProps(newProps: IProps): void;
    shouldComponentUpdate(newProps: IProps): boolean;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
