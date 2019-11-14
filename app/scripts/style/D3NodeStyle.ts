import * as d3 from 'd3';
import {NodeStyleBase, SvgVisual} from 'yfiles'
import {IFlowNodeViewModel} from '../core/IFlowNodeViewModel';
import {BarChartFlowNodeViewModel} from '../elements/barchart/BarChartFlowNodeViewModel';
import * as  _ from 'lodash';

const margin = {
    top: 30,
    right: 3,
    bottom: -20,
    left: 3
};

const xHelper = d3.scaleBand().padding(0.2);

const yHelper = d3.scaleLinear().nice();

const color = d3
    .scaleLinear()
    .range(['#1dccc2', '#2f5b88'])
    .interpolate(d3.interpolateHcl);

/**
 * A node style that triggers the sparkline rendering and includes the result in
 * the node visualization.
 */
export default class D3ChartNodeStyle extends NodeStyleBase {
    constructor() {
        super();
    }

    /**
     * Creates the visual for a node.
     * @see Overrides {@link NodeStyleBase#createVisual}
     * @return {SvgVisual}
     */
    createVisual(renderContext, node) {
        // create a g element and use it as a container for the sparkline visualization
        const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const svgVisual = new SvgVisual(g);

        // render the node
        const {
            layout: {x, y, width, height},
            tag: viewModel
        } = node;
        if (!BarChartFlowNodeViewModel.isInstance(viewModel)) {
            throw new Error('Expected a view-model for the D3NodeStyle.');
        }
        let data = (viewModel as BarChartFlowNodeViewModel).values;
        if (_.isNil(data) || !_.isArray(data)) {
            data = [];
        }
        data = this.normalizeData(data);
        xHelper.domain(d3.range(0, data.length)).range([5, width - 5]);
        yHelper.domain([0, d3.max(data)]).range([height - margin.bottom, margin.top]);
        color.domain([0, d3.max(data)]);

        const group = d3.select(g);

        // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        // // temporarily add the svg to the body so the elements can be measured
        // window.document.body.appendChild(svg);
        //
        // const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        //
        // const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        // clipPath.setAttribute('id', 'round-corner');
        // const clipRec = document.createElementNS('http://www.w3.org/2000/svg', 'rec');
        // clipRec.setAttribute('width', '70');
        // clipRec.setAttribute('height', '30');
        // clipRec.setAttribute('rx', '6');
        // clipRec.setAttribute('ry', '6');
        // clipPath.appendChild(clipRec);
        // defs.appendChild(clipPath);
        // svg.appendChild(defs);
        const defs = group.append('defs');


        // clipping of the whole node
        defs.append('clipPath')
            .attr('id', 'total')
            .append('rect')
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('width', 70)
            .attr('height', 90)
            .attr('x', 0)
            .attr('y', 0);
        group.attr('clip-path', 'url(#total)');

        // the background
        group.append('rect')
            .attr('width', 70)
            .attr('height', 90)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('fill', '#323232');


        // the bars
        group
            .append('g')
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (_, i) => xHelper(i))
            .attr('y', d => yHelper(d))
            .attr('height', d => yHelper(0) - yHelper(d))
            .attr('width', xHelper.bandwidth())
            .attr('data-value', d => d)
            .attr('fill', d => color(d))
            .attr('stroke', 'none');

        // the header
        group.append('rect')

            .attr('width', 70)
            .attr('height', 20)
            .attr('opacity', 0.8)
            .attr('fill', 'seagreen');
        //enable-disable
        group.append('ellipse')
        //         <ellipse title="Enable/disable this element" rx="3" ry="3" transform="translate(60,10)" fill="{Binding enabled, Converter=enabledConverter}" stroke-width="0.8" stroke="white" opacity="0.8"></ellipse>
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('id', 'enabler')
            .attr('fill', node.tag.enabled ? 'transparent' : 'red')
            .attr('stroke-width', 0.8)
            .attr('opacity', 0.8)
            .attr('stroke', 'white')
            .attr('transform', 'translate(60,10)');

        group.append('text')
            .attr('class', 'flow-node-title')
            .attr('x', '7')
            .attr('y', '13')
            .text('BarChart');
        // the border
        group.append('rect')
            .attr('width', 70)
            .attr('height', 90)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('stroke', '#636363')
            .attr('stroke-width', 1)
            .attr('fill', 'transparent');

        Object.assign(svgVisual, {
            width,
            height,
            data
        });
        return svgVisual
    }

    /**
     * Re-renders the node using the old visual for performance reasons.
     * @see Overrides {@link NodeStyleBase#updateVisual}
     * @return {SvgVisual}
     */
    updateVisual(renderContext, oldVisual, node) {
        const g = oldVisual.svgElement;

        const {
            layout: {x, y, width, height},
            tag: viewModel
        } = node;
        if (!BarChartFlowNodeViewModel.isInstance(viewModel)) {
            throw new Error('Expected a view-model for the D3NodeStyle.');
        }
        let data = (viewModel as BarChartFlowNodeViewModel).values;
        if (_.isNil(data) || !_.isArray(data)) {
            data = [];
        }
        data = this.normalizeData(data);

        xHelper.domain(d3.range(0, data.length)).range([0, width]);
        yHelper.domain([0, d3.max(data)]).range([height - margin.bottom, margin.top]);
        color.domain([0, d3.max(data)]);

        const group = d3.select(g);
        // group.append('rect')
        //     .attr('width', 70)
        //     .attr('height', 70)
        //     .attr('rx', 6)
        //     .attr('ry', 6)
        //     .attr('fill', '#323232');
        group
            .attr('transform', `translate(${x} ${y})`)
            .select('rect')
            .attr('width', width)
            .attr('height', height);

        group.select('#enabler')
            .attr('fill', node.tag.enabled ? 'transparent' : 'red');
        if (data !== oldVisual.data || oldVisual.width !== width || oldVisual.height !== height) {
            Object.assign(oldVisual, {
                width,
                height,
                data
            });
            const dataSelection = group
                .select('g')
                .selectAll('rect')
                .data(data);

            dataSelection
                .enter()
                .append('rect')
                .attr('x', (_, i) => xHelper(i))
                .attr('y', d => yHelper(d))
                .attr('height', d => yHelper(0) - yHelper(d))
                .attr('width', xHelper.bandwidth())
                .attr('data-value', d => d)
                .attr('fill', d => color(d))
                .attr('stroke', 'none');

            dataSelection.exit().remove();

            dataSelection
                .transition()
                .attr('x', (_, i) => xHelper(i))
                .attr('width', xHelper.bandwidth())
                .attr('y', d => yHelper(d))
                .attr('fill', d => color(d))
                .attr('height', d => yHelper(0) - yHelper(d))
        }
        return oldVisual
    }

    normalizeData(data: number[]): number[] {
        if (_.isNil(data) || data.length === 0) {
            return data;
        }
        const max = _.max(data);
        if (max === 0) {
            return data;
        }
        return data.map(d => {
            return d * 60 / max;
        })
    }
}
