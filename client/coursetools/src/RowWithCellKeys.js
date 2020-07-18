// Header.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import DataGrid from 'react-data-grid';
import {Row} from 'react-data-grid';


class RowWithCellKeys extends Row {

  constructor(props){
    super(props);
  }

  getCell = (column) => {
    const CellRenderer = this.props.cellRenderer;
    const { idx, cellMetaData, isScrolling, row, isSelected, scrollLeft, lastFrozenColumnIndex } = this.props;
    const { key, formatter } = column;
    const baseCellProps = { key: `${key}-${idx}`, idx: column.idx, rowIdx: idx, height: this.getRowHeight(), column, cellMetaData };

    const cellProps = {
      ref: (node) => {
        this[key] = node;
      },
      key: key,
      value: this.getCellValue(key || column.idx),
      rowData: row,
      isRowSelected: isSelected,
      expandableOptions: this.getExpandableOptions(key),
      formatter,
      isScrolling,
      scrollLeft,
      lastFrozenColumnIndex
    };

    return <CellRenderer {...baseCellProps} {...cellProps} />;
  };
}

export default RowWithCellKeys;
