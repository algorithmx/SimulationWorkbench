/*
 * This file is part of `Simulation Workbench`.
 * 
 * `Simulation Workbench` is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * `Simulation Workbench` is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with `Simulation Workbench`.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * Copyright (C) [2024] [Yunlong Lian]
*/

import { Table, CellValue } from './Table';
import { Column, Row, Cell, 
    TextCell, NumberCell, ChevronCell, 
    Id, DefaultCellTypes } from '@silevis/reactgrid';

export interface CustomCell extends Cell {
    type: 'text' | 'header' | 'custom';
    text?: string;
    value?: number; // Add this line
    colspan?: number;
    nonEditable?: boolean;
    customRenderer?: string;
    props?: Record<string, unknown>;
}

export class SimulationProject {
    private name: string;
    private description: string;
    private author: string;
    private version: string;
    private tables: Table[];
    private stages: any[]; // Consider creating a Stage type/interface

    constructor(name: string, description: string = '', author: string = '', version: string = '0.1') {
        this.name = name;
        this.description = description;
        this.author = author;
        this.version = version;
        this.tables = [];
        this.stages = [];
    }

    setName(name: string): this {
        this.name = name;
        return this;
    }

    updateCell(tableId: number, rowIndex: number, colIndex: number, value: string): this {
        this.tables.forEach((table: Table) => {
            if (table.getId() === tableId) {
                table.updateCell(rowIndex, colIndex, value);
            }
        });
        return this;
    }

    setDescription(description: string): this {
        this.description = description;
        return this;
    }

    addTable(table: Table): this {
        this.tables.push(table);
        return this;
    }

    addNewTable(iT: number): this {
        const nR = this.getNumberOfRows(iT);
        const newTable = new Table(Date.now()).setEmptyColumn(nR, this.getTable(iT).getTableToolName());
        this.tables.splice(iT, 0, newTable);
        return this;
    }

    addStage(stage: any): void { // Consider using a proper type for stage
        this.stages.push(stage);
    }

    getNumberOfRows(iT: number = 0): number {
        this.validateTableIndex(iT);
        return this.tables[iT].getNumberOfRows();
    }

    getName(): string {
        return this.name;
    }

    getTable(iT: number): Table {
        this.validateTableIndex(iT);
        return this.tables[iT];
    }

    getTables(): Table[] {
        return this.tables;
    }

    deleteTable(iT: number): void {
        this.validateTableIndex(iT);
        this.tables.splice(iT, 1);
    }

    addRowAbove(iT: number, rowIndex: number): void {
        this.validateTableIndex(iT);
        this.tables[iT].addRowAbove(rowIndex);
    }

    addRowLast(iT: number): void {
        this.validateTableIndex(iT);
        this.tables[iT].addRowLast();
    }

    deleteRow(iT: number, rowIndex: number): void {
        this.validateTableIndex(iT);
        this.tables[iT].deleteRow(rowIndex);
    }

    addColumn(iT: number, columnIndex: number, defaultNameRow1: string = 'PNew'): void {
        this.validateTableIndex(iT);
        this.tables[iT].addColumn(columnIndex, defaultNameRow1);
    }

    deleteColumn(iT: number, columnIndex: number): void {
        this.validateTableIndex(iT);
        this.tables[iT].deleteColumn(columnIndex);
    }

    getTableToolName(iT: number): string {
        this.validateTableIndex(iT);
        return this.tables[iT].getTableToolName();
    }

    calculateCellGroups(iT: number): { start: number; end: number; value: CellValue; col: number }[] {
        this.validateTableIndex(iT);
        return this.tables[iT].calculateCellGroups();
    }

    getColumns(): Column[] {
        const columns: Column[] = [];
        if (this.tables.length > 0) {
            columns.push({
                columnId: 'Tool',
                width: 60,
                reorderable: false,
                resizable: false
            });
            columns.push({
                columnId: '',
                width: 20,
                reorderable: false,
                resizable: false
            });
            let columnIndex = 0;
            this.tables.forEach((table) => {
                const tableColumns = table.getData()[1].length;
                columns.push(...Array(tableColumns).fill(0).map((_, i) => ({
                    columnId: `col${columnIndex + i}`,
                    width: 80,
                    reorderable: false,
                    resizable: true
                })));
                columnIndex += tableColumns;
            });
        }
        console.log('Columns:', columns);
        return columns;
    }

    getRows(totalColumns: number) : Row[] {
        const maxRows = Math.max(...this.tables.map(table => table.getNumberOfRows()));
        console.log('Max Rows:', maxRows);
        const nCol = totalColumns - 2;
        const rows: Row[] = [
            {
                rowId: 0,
                cells: [
                    {type: 'text', text: 'Tool'},
                    {type: 'text', text: ''},
                    ...Array(nCol).fill({type: 'text', text: ''})
                ]
            }
        ];
        for (let rowIndex = 1; rowIndex < maxRows; rowIndex++) {
            const cells: DefaultCellTypes[] = [
                {type: 'number', value: rowIndex},
                {type: 'text', text: ''}
            ];
            this.tables.forEach((table) => {
                cells.push(...table.getRow(rowIndex).map(cellValue => ({ 
                    type: 'text' as const, 
                    text: cellValue?.toString() ?? '' 
                })));
            });
            rows.push({
                rowId: rowIndex.toString(),
                cells: cells
            });
        }
        console.log('Rows:', rows);
        return rows;
    }

    getColumnsAndRows(): {
        columns: Column[];
        rows: Row[];
    } {
        if (this.tables.length === 0) {
            return { columns: [], rows: [] };
        }

        // Create columns
        const columns = this.getColumns();
        // Create rows
        const rows = this.getRows(columns.length);

        return { columns, rows };
    }

    getTableIndexForColumn(columnIndex: number): number {
        let accumulatedColumns = 0;
        for (let i = 0; i < this.tables.length; i++) {
            accumulatedColumns += this.tables[i].getData()[1].length;
            if (columnIndex < accumulatedColumns) {
                return i;
            }
        }
        return this.tables.length - 1;
    }

    getColumnOffsetForTable(tableIndex: number): number {
        return this.tables.slice(0, tableIndex).reduce((acc, table) => acc + table.getData()[1].length, 0);
    }

    private validateTableIndex(iT: number): void {
        if (iT < 0 || iT >= this.tables.length) {
            throw new Error('Table index out of range');
        }
    }
}
