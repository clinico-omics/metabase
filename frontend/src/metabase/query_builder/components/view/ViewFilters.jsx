/* @flow */

import React, { Component } from "react";

import FieldList from "../FieldList";

import FilterPopoverHeader from "../filters/FilterPopoverHeader";
import FilterPopoverPicker from "../filters/FilterPopoverPicker";
import FilterPopoverFooter from "../filters/FilterPopoverFooter";

import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";
import type { FieldFilter, ConcreteField } from "metabase/meta/types/Query";

import Filter from "metabase-lib/lib/queries/structured/Filter";

type Props = {
  maxHeight?: number,
  query: StructuredQuery,
  filter?: Filter,
  onChangeFilter: (filter: Filter) => void,
  onClose: () => void,
  showFieldPicker?: boolean,
};

type State = {
  filter: Filter,
};

// NOTE: this is duplicated from FilterPopover. Consider merging them
export default class ViewFilters extends Component {
  props: Props;
  state: State;

  static defaultProps = {
    showFieldPicker: true,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      // $FlowFixMe
      filter: new Filter(props.filter || [], null, props.query),
    };
  }

  componentWillMount() {
    window.addEventListener("keydown", this.handleCommitOnEnter);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleCommitOnEnter);
  }

  handleCommit = () => {
    this.handleCommitFilter(this.state.filter);
  };

  handleCommitOnEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      this.handleCommitFilter(this.state.filter);
    }
  };

  handleCommitFilter = (filter: FieldFilter) => {
    if (filter.isValid()) {
      this.props.onChangeFilter(filter);
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  };

  handleFieldChange = (fieldRef: ConcreteField) => {
    this.setState({
      filter: this.state.filter.setDimension(fieldRef, {
        useDefaultOperator: true,
      }),
    });
  };

  handleFilterChange = (newFilter: FieldFilter) => {
    this.setState({ filter: this.state.filter.set(newFilter) });
  };

  handleClearField = () => {
    this.setState({ filter: this.state.filter.setDimension(null) });
  };

  render() {
    const { query, showFieldPicker } = this.props;
    const { filter } = this.state;

    const dimension = filter.dimension();
    if (filter.isSegmentFilter() || !dimension) {
      return (
        <div className="full p1">
          <FieldList
            field={dimension && dimension.mbql()}
            fieldOptions={query.filterFieldOptions(filter)}
            segmentOptions={query.filterSegmentOptions(filter)}
            table={query.table()}
            onFieldChange={this.handleFieldChange}
            onFilterChange={this.handleCommitFilter}
            width={410}
            className="text-purple"
          />
        </div>
      );
    } else {
      return (
        <div className="full p1">
          <FilterPopoverHeader
            filter={filter}
            showFieldPicker={showFieldPicker}
            onFilterChange={this.handleFilterChange}
            onClearField={this.handleClearField}
          />
          <FilterPopoverPicker
            filter={filter}
            onFilterChange={this.handleFilterChange}
            onCommit={this.handleCommit}
          />
          <FilterPopoverFooter
            filter={filter}
            onFilterChange={this.handleFilterChange}
            onCommit={this.handleCommit}
          />
        </div>
      );
    }
  }
}