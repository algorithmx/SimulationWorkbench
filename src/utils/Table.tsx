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

export type CellValue = string | number | boolean | null | HeaderCell;
export type TableRow = CellValue[];
export type TableData = TableRow[];

export interface HeaderCell {
    colspan: number;
    [key: string]: string | number;
}

export class Table {
    private readonly id: number;
    private data: TableData;
    private nRows: number;
    private nCols: number;

    constructor(id: number, data: TableData = []) {
        this.id = id;
        this.data = data;
        this.nRows = data.length;
        this.nCols = data.length > 0 ? data[0].length : 0;
    }

    public getNumberOfRows(): number {
        return this.nRows;
    }

    public setEmptyColumn(nR: number, topCell: string = ''): this {
        this.nCols = 1;
        this.nRows = nR + 2;
        this.data = [
            [{value: topCell, colspan: 1}],
            [''],
            ...Array(nR).fill(Array(this.nCols).fill(''))
        ];
        return this;
    }

    public getId(): number {
        return this.id;
    }

    public getRow(rowIndex: number): TableRow {
        return this.data[rowIndex];
    }

    public getData(): TableData {
        return this.data;
    }

    public getCell(rowIndex: number, colIndex: number): CellValue  {
        if (rowIndex < 0 || rowIndex >= this.nRows || colIndex < 0 || colIndex >= this.nCols) {
            throw new Error('Invalid row or column index');
        }
        return this.data[rowIndex][colIndex];
    }

    public updateCell(rowIndex: number, colIndex: number, value: string): this {
        if (rowIndex < 0 || rowIndex >= this.nRows || colIndex < 0 || colIndex >= this.nCols) {
            throw new Error('Invalid row or column index');
        }
        this.data[rowIndex][colIndex] = value;
        return this;
    }

    public addRowAbove(rowIndex: number): this {
        if (rowIndex < 0 || rowIndex > this.nRows) {
            throw new Error('Invalid row index');
        }
        this.data.splice(rowIndex, 0, new Array(this.nCols).fill(''));
        this.nRows++;
        return this;
    }

    public addRowLast(): this {
        return this.addRowAbove(this.nRows);
    }

    public deleteRow(rowIndex: number): this {
        if (rowIndex <= 0 || rowIndex >= this.nRows) {
            throw new Error('Invalid row index or attempt to delete header row');
        }
        this.data.splice(rowIndex, 1);
        this.nRows--;
        return this;
    }

    public addColumn(columnIndex: number, defaultNameRow1: string = 'PNew'): this {
        if (columnIndex < 0 || columnIndex > this.nCols) {
            throw new Error('Invalid column index');
        }
        this.data = this.data.map((row, rowIndex): TableRow => {
            if (rowIndex === 0) {
                return [{ ...row[0] as HeaderCell, colspan: (row[0] as HeaderCell).colspan + 1 }];
            }
            const newCell = rowIndex === 1 ? defaultNameRow1 : '';
            return [...row.slice(0, columnIndex), newCell, ...row.slice(columnIndex)];
        });
        this.nCols++;
        return this;
    }

    public deleteColumn(columnIndex: number): this {
        if (columnIndex < 0 || columnIndex >= this.nCols || this.nCols === 1) {
            throw new Error('Invalid column index or cannot delete last column');
        }
        this.data = this.data.map((row, rowIndex): TableRow => {
            if (rowIndex === 0) {
                return [{ ...row[0] as HeaderCell, colspan: (row[0] as HeaderCell).colspan - 1 }];
            }
            return [...row.slice(0, columnIndex), ...row.slice(columnIndex + 1)];
        });
        this.nCols--;
        return this;
    }

    public getTableToolName(): string {
        if (this.data.length > 0 && this.data[0].length > 0) {
            const firstCell = this.data[0][0] as HeaderCell;
            return firstCell.value as string || 'Unknown';
        }
        return 'Unknown';
    }

    public calculateCellGroups(): { start: number; end: number; value: CellValue; col: number }[] {
        const groups: { start: number; end: number; value: CellValue; col: number }[] = [];
        const valueRows = this.data.slice(2);
        const columnCount = this.data[1].length;

        for (let col = 0; col < columnCount; col++) {
            let currentGroup = { start: 0, end: 0, value: valueRows[0][col] };
            
            for (let row = 0; row < valueRows.length; row++) {
                if (row === 0 || valueRows[row][col] === currentGroup.value) {
                    currentGroup.end = row;
                } else {
                    groups.push({ ...currentGroup, col });
                    currentGroup = { start: row, end: row, value: valueRows[row][col] };
                }
            }
            
            groups.push({ ...currentGroup, col });
        }

        return groups;
    }

    public static createNewTable(toolOptions: Record<string, unknown>, data: TableData, onUpdateSystemMessage: (message: string) => void): Table {
        const tmp_id = Date.now();
        const toolName = Object.keys(toolOptions)[0];
        onUpdateSystemMessage(`Create a new table [${toolName}] (id=${tmp_id})`);
        return new Table(tmp_id, [
            [{ value: toolName, colspan: 1 }],
            ['PNew'],
            ...data.slice(2).map(row => row.map(() => ''))
        ]);
    }

    public getUniqueColumnValues(col: number): CellValue[] {
        const columnValues = this.data.slice(2).map(row => row[col]);
        return [...new Set(columnValues)].filter(value => value !== '');
    }
}
