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
    Column, Row, Cell, CellStyle, CellChange, Id,
    TextCell, NumberCell, DropdownCell
} from '@silevis/reactgrid';
import { ButtonCell, ButtonCellTemplate } from '../components/ButtonCell';

export type AllCellTypes = TextCell | NumberCell | DropdownCell | ButtonCell;

function toColumnName(i: number, iT: number): string {
    return `tab_${iT}__col_${i}`
}

export function toIndexes(colName: string) {
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

    updateFromParsedData(
        simProjData: {
            name: string,
            description: string,
            author: string,
            version: string,
            tables: Table[],
            tools: Tool[],
            stages: string[]
        }
    ): this {
        this.name = simProjData.name;
        this.description = simProjData.description;
        this.author = simProjData.author;
        this.version = simProjData.version;
        this.tools = simProjData.tools;
        this.tables = simProjData.tables.map(
            (tableData: any) => new Table(tableData.id, tableData.data));
        return this;
    }

    updateTools(tools: Tool[]): this {
        this.tools = tools;
        return this;
    }

    updateToolScript(toolName: string, script: string, language: string): this {
        const tool = this.tools.find(t => t.getName() === toolName);
        if (tool) {
            tool.setScript(script);
            tool.setLanguage(language);
        }
        return this;
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

    resetTables(table: Table) : this {
        this.tables = [new Table(Date.now()).resetTables(table)];
        return this;
    }

    addNewTable(iT: number): this {
        const iTa = Math.min(iT, this.tables.length - 1);
        const toolName = this.getTable(iTa).getTableToolName();
        const nR = this.getNumberOfRows(iTa);
        const newTable = new Table(Date.now()).setEmptyColumn(nR, toolName);
        this.tables.splice(iT, 0, newTable);
        return this;
    }

    addStage(stage: any): void { // Consider using a proper type for stage
        this.stages.push(stage);
    }

    getNumberOfTables(): number {
        return this.tables.length;
    }

    getNumberOfRows(iT: number = 0): number {
        this.validateTableIndex(iT);
        return this.tables[iT].getNumberOfRows();
    }

    getNumberOfColumns(iT: number = 0): number {
        this.validateTableIndex(iT);
        return this.tables[iT].getNumberOfColumns();
    }

    getAuthor(): string {
        return this.author;
    }

    setAuthor(author: string): this {
        this.author = author;
        return this;
    }

    getTools(): Tool[] {
        return this.tools;
    }

    getVersion(): string {
        return this.version;
    }

    setVersion(version: string): this {
        this.version = version;
        return this;
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

    addRowAbove(rowIndex: number): this {
        if (rowIndex > 1) {
            this.tables = this.tables.map(table => table.addRowAbove(rowIndex));
        }
        return this;
    }

    addRowLast(): this {
        this.tables = this.tables.map(table =>table.addRowLast());
        return this;
    }

    deleteRow(rowIndex: number): this {
        this.tables = this.tables.map(table => table.deleteRow(rowIndex));
        return this;
    }

    addColumn(iT: number, columnIndex: number, defaultNameRow1: string = 'PNew'): this {
        this.validateTableIndex(iT);
        this.tables[iT].addColumn(columnIndex, defaultNameRow1);
        return this;
    }

    deleteColumn(iT: number, columnIndex: number): this {
        this.validateTableIndex(iT);
        this.tables[iT].deleteColumn(columnIndex);
        return this;
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
                columnId: 'Run',
                width: 10,
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

    private calculateColumnImmutability(): boolean[] {
        return this.tables.flatMap((table: Table) => 
            table.getRow(1).map((cell: CellValue) => cell === '')
        );
    }

    private makeCellStyle(text: CellValue): CellStyle {
        if (typeof text === 'string') {
            if (text === 'success') {
                return {color: 'black', background: 'lightgreen'};
            } else if (text === 'failed') {
                return {color: 'black', background: 'lightcoral'};
            } else if (text === 'running') {
                return {color: 'black', background: 'lightyellow'};
            } else if (text === 'pending') {
                return {color: 'black', background: 'lightblue'};
            } else if (text === 'info') {
                return {color: 'black', background: 'orange'};
            } else {
                return {color: 'black', background: 'white'};
            }
        } else {
            return {color: 'black', background: 'white'};
        }
    }

    getRows(
        rowButtonCellOnClick: (r:number) => void
    ): CustomRow[] {
        const maxRows = Math.max(...this.tables.map(table => table.getNumberOfRows()));
        const cells0: AllCellTypes[] = [
            { type: 'text', text: 'Tool', nonEditable: true },
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
        const columnImmutability = this.calculateColumnImmutability();
        for (let rowIndex = 1; rowIndex < maxRows; rowIndex++) {
            const cells: AllCellTypes[] = [
                (rowIndex === 1) ? { type: 'text', text: 'Params', nonEditable: true } :
                    { type: 'number', value: rowIndex-1, nonEditable: true },
                (rowIndex === 1) ? { type: 'text', text: '', nonEditable: true } :
                    { type: 'button', text: rowIndex.toString(), nonEditable: true, 
                        status: 'play', onClick: rowButtonCellOnClick}
            ];
            let cellIndex = 0;
            this.tables.forEach((table) => {
                table.getRow(rowIndex).forEach((cellValue : CellValue) => {
                    cells.push({
                        type: 'text' as const,
                        text: cellValue?.toString() ?? '',
                        nonEditable: (rowIndex!==1) && columnImmutability[cellIndex],
                        style: this.makeCellStyle(cellValue)
                    });
                    cellIndex++;
                });
            });
            rows.push({
                rowId: rowIndex.toString(),
                cells: cells
            });
        }
        return rows;
    }

    getColumnsAndRows(
        rowButtonCellOnClick: (r:number) => void
    ): {
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
        const rows = this.getRows(rowButtonCellOnClick);
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
