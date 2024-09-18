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
import { Tool } from './Tool';
import {
    Column, Row, Cell, CellChange, Id,
    TextCell, NumberCell, DropdownCell
} from '@silevis/reactgrid';

export type AllCellTypes = TextCell | NumberCell | DropdownCell;

function toColumnName(i: number, iT: number): string {
    return `tab_${iT}__col_${i}`
}

function toIndexes(colName: string) {
    const col = Number(colName.split('__')[1].split('_')[1]);
    const tab = Number(colName.split('__')[0].split('_')[1])
    return { tab, col }
}

export interface CustomRow extends Omit<Row, 'cells'> {
    rowId: Id;
    cells: AllCellTypes[];
}

export class SimulationProject {
    private name: string;
    private description: string;
    private author: string;
    private version: string;
    private tables: Table[];
    private tools: Tool[];
    private stages: any[]; // Consider creating a Stage type/interface

    constructor(name: string, tools: Tool[], description: string = '', author: string = '', version: string = '0.1') {
        this.name = name;
        this.description = description;
        this.author = author;
        this.version = version;
        this.tools = [...tools];
        this.tables = [];
        this.stages = [];
    }

    setName(name: string): this {
        this.name = name;
        return this;
    }

    applyChanges(changes: CellChange<AllCellTypes>[]): this {
        changes.forEach((change: CellChange<AllCellTypes>) => {
            const { rowId, columnId, newCell, previousCell } = change;
            const { tab, col } = toIndexes(columnId.toString());
            const r = Number(rowId);
            if (newCell.type === 'text') {
                this.updateCell(tab, r, col, newCell.text);
            } else if (newCell.type === 'number') {
                this.updateCell(tab, r, col, newCell.value.toString());
            } else if (newCell.type === 'dropdown' && previousCell.type === 'dropdown') {
                if (previousCell.isOpen !== newCell.isOpen) {
                    this.updateTopCellStatus(tab, r, col, newCell.isOpen ?? false);
                    if (previousCell.selectedValue !== newCell.selectedValue) {
                        this.updateTopCellValue(tab, r, col, newCell.selectedValue ?? '');
                    }
                }                
            } else {
                this.updateCell(tab, r, col, 'XXX');
            }
        });
        return this;
    }

    updateTopCellValue(iT: number, rowIndex: number, colIndex: number, value: string): this {
        this.tables.forEach((table: Table, index: number) => {
            if (iT === index) {
                table.updateTopCellValue(rowIndex, colIndex, value);
            }
        });
        return this;
    }

    updateTopCellStatus(iT: number, rowIndex: number, colIndex: number, isOpen: boolean): this {
        this.tables.forEach((table: Table, index: number) => {
            if (iT === index) {
                table.updateTopCellStatus(rowIndex, colIndex, isOpen);
            }
        });
        return this;
    }

    toggleTopCellStatus(iT: number, rowIndex: number, colIndex: number): this {
        this.tables.forEach((table: Table, index: number) => {
            if (iT === index) {
                table.toggleTopCellStatus(rowIndex, colIndex);
            }
        });
        return this;
    }

    updateCell(iT: number, rowIndex: number, colIndex: number, value: string): this {
        this.tables.forEach((table: Table, index: number) => {
            if (iT === index) {
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
            this.tables.forEach((table, iT) => {
                columns.push(...Array(table.getNumberOfColumns()).fill(0).map((_, i) => ({
                    columnId: toColumnName(i, iT),
                    width: 100,
                    reorderable: false,
                    resizable: true
                })));
            });
        }
        return columns;
    }

    getRows(): CustomRow[] {
        const maxRows = Math.max(...this.tables.map(table => table.getNumberOfRows()));
        const cells0: AllCellTypes[] = [
            { type: 'number', value: 0, nonEditable: true },
            { type: 'text', text: '', nonEditable: true }
        ];
        this.tables.forEach((table: Table) => {
            const nc = table.getNumberOfColumns();
            cells0.push({
                type: 'dropdown',
                isOpen: table.getToolStatus(),
                selectedValue: table.getTableToolName(),
                values: this.tools.map(
                    (tool: Tool) => ({ label: tool.name, value: tool.name })
                )
            });
            cells0.push(...Array(nc - 1).fill({ type: 'text', text: '' } as TextCell));
        });
        const rows: CustomRow[] = [
            { rowId: 0, cells: cells0 }
        ];
        for (let rowIndex = 1; rowIndex < maxRows; rowIndex++) {
            const cells: AllCellTypes[] = [
                { type: 'number', value: rowIndex, nonEditable: true },
                { type: 'text', text: '', nonEditable: true }
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
        return rows;
    }

    getColumnsAndRows(): {
        columns: Column[];
        rows: CustomRow[];
    } {
        if (this.tables.length === 0) {
            return { columns: [], rows: [] };
        }
        const columns = this.getColumns();
        if (columns.length === 0) {
            return { columns: [], rows: [] };
        }
        const rows = this.getRows();
        return { columns, rows };
    }

    getTableIndexForColumn(columnIndex: number): number {
        let accumulatedColumns = 0;
        for (let i = 0; i < this.tables.length; i++) {
            accumulatedColumns += this.tables[i].getNumberOfColumns();
            if (columnIndex < accumulatedColumns) {
                return i;
            }
        }
        return this.tables.length - 1;
    }

    getColumnOffsetForTable(tableIndex: number): number {
        return this.tables.slice(0, tableIndex).reduce((acc, table) => acc + table.getNumberOfColumns(), 0);
    }

    private validateTableIndex(iT: number): void {
        if (iT < 0 || iT >= this.tables.length) {
            throw new Error('Table index out of range');
        }
    }
}
