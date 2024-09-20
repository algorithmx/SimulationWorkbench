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


export interface ToolCell {
    toolname: string;
    colspan: number;
    isOpen: boolean;
}

export function isToolCell(cell: CellValue): cell is ToolCell {
    return typeof cell === 'object' && 'toolname' in cell;
}

export type CellValue = string | number | ToolCell;
export type TableRow = CellValue[];
export type TableData = TableRow[];

type TableId = number;
type RowIndex = number;
type ColumnIndex = number;

export class Table {
    private readonly id: number;
    private data: TableData;
    private nRows: number;
    private nCols: number;

    constructor(id: number, data: TableData = []) {
        this.id = id;
        this.data = data;
        this.nRows = data.length;
        this.nCols = data.length > 1 ? data[1].length : 0;
    }

    private validateIndices(rowIndex: RowIndex, colIndex: ColumnIndex): void {
        if (rowIndex < 0 || rowIndex >= this.nRows || colIndex < 0 || colIndex >= this.nCols) {
            throw new Error('Invalid row or column index');
        }
    }


    public getNumberOfRows(): number {
        return this.nRows;
    }

    public getNumberOfColumns(): number {
        return this.nCols;
    }

    public getToolStatus(): boolean {
        if (this.data.length > 0 && this.data[0].length > 0) {
            const firstCell = this.data[0][0] as ToolCell;
            return firstCell.isOpen;
        }
        return false;
    }

    public getToolName(): string {
        return (this.data[0]?.[0] as ToolCell)?.toolname ?? '';
    }

    public setEmptyColumn(nR: number, topCell: string = ''): this {
        if (nR < 3) {
            throw new Error(`setEmptyColumn: Invalid number of rows ${nR}`);
        }
        this.nCols = 1;
        this.nRows = nR;
        this.data = [
            [{toolname: topCell, colspan: 1, isOpen: false}],
            [''],
            ...Array(nR-2).fill(Array(this.nCols).fill(''))
        ];
        return this;
    }

    public getId(): number {
        return this.id;
    }

    public getRow(rowIndex: RowIndex): TableRow {
        this.validateIndices(rowIndex, 0);
        return this.data[rowIndex];
    }

    public getData(): TableData {
        return this.data;
    }

    public getCell(rowIndex: RowIndex, colIndex: ColumnIndex): CellValue {
        if (rowIndex < 0 || rowIndex >= this.nRows || colIndex < 0 || colIndex >= this.nCols) {
                throw new Error('Invalid row or column index');
            }
            return this.data[rowIndex][colIndex];
    }

    public updateCell(rowIndex: RowIndex, colIndex: ColumnIndex, value: string): this {
        this.validateIndices(rowIndex, colIndex);
        this.data = this.data.map((row, rIndex) => 
            rIndex === rowIndex
                ? row.map((cell, cIndex) => 
                    cIndex === colIndex 
                        ? (rIndex === 0 && cIndex === 0 
                            ? {...cell as ToolCell, toolname: value, isOpen: false}
                            : value)
                        : cell
                )
                : row
        );
        return this;
    }

    public updateTopCellValue(rowIndex: RowIndex, colIndex: ColumnIndex, value: string): this {
        this.validateIndices(rowIndex, colIndex);
        if (rowIndex === 0 && colIndex === 0) {
            this.data[0][0] = {...this.data[0][0] as ToolCell, toolname: value};
        }
        return this;
    }

    public updateTopCellStatus(rowIndex: RowIndex, colIndex: ColumnIndex, isOpen: boolean): this {
        this.validateIndices(rowIndex, colIndex);
        if (rowIndex === 0 && colIndex === 0) {
            this.data[0][0] = {...this.data[0][0] as ToolCell, isOpen: isOpen};
        }
        return this;
    }

    public toggleTopCellStatus(rowIndex: RowIndex, colIndex: ColumnIndex): this {
        this.validateIndices(rowIndex, colIndex);
        if (rowIndex === 0 && colIndex === 0) {
            this.data[0][0] = {...this.data[0][0] as ToolCell, isOpen: !(this.data[0][0] as ToolCell).isOpen};
        }
        return this;
    }

    public addRowAbove(rowIndex: RowIndex): this {
        this.validateIndices(rowIndex, 0);
        this.data = [
            ...this.data.slice(0, rowIndex),
            new Array(this.nCols).fill(''),
            ...this.data.slice(rowIndex)
        ];
        this.nRows++;
        return this;
    }

    public addRowLast(): this {
        return this.addRowAbove(this.nRows);
    }

    public deleteRow(rowIndex: RowIndex): this {
        this.validateIndices(rowIndex, 0);
        if (rowIndex <= 1) {
            throw new Error('Cannot delete header or first data row');
        }
        this.data = [...this.data.slice(0, rowIndex), ...this.data.slice(rowIndex + 1)];
        this.nRows--;
        return this;
    }

    public addColumn(columnIndex: ColumnIndex, defaultNameRow1: string = 'PNew'): this {
        if (columnIndex >= 0) {
            this.validateIndices(0, columnIndex);
        }
        this.data = this.data.map((row, rowIndex) => {
            if (rowIndex === 0) {
                return [{ ...row[0] as ToolCell, colspan: (row[0] as ToolCell).colspan + 1 }];
            }
            const newCell = rowIndex === 1 ? defaultNameRow1 : '';
            return [...row.slice(0, columnIndex+1), newCell, ...row.slice(columnIndex+1)];
        });
        this.nCols++;
        return this;
    }
    

    public deleteColumn(columnIndex: ColumnIndex): this {
        this.validateIndices(0, columnIndex);
        if (this.nCols === 1) {
            throw new Error('Cannot delete last column');
        }
        this.data = this.data.map((row, rowIndex): TableRow => {
            if (rowIndex === 0) {
                return [{ ...row[0] as ToolCell, colspan: (row[0] as ToolCell).colspan - 1 }];
            }
            return [...row.slice(0, columnIndex), ...row.slice(columnIndex + 1)];
        });
        this.nCols--;
        return this;
    }

    public getTableToolName(): string {
        if (this.data.length > 0 && this.data[0].length > 0) {
            const firstCell = this.data[0][0] as ToolCell;
            return firstCell.toolname as string || 'Unknown';
        }
        return 'Unknown';
    }

    public resetTables(newTable: Table): this {
        this.data = newTable.getData();
        this.nRows = newTable.getNumberOfRows();
        this.nCols = newTable.getNumberOfColumns();
        return this;
    }

    /**
     * Calculates cell groups for each column in the table.
     * A cell group is a contiguous range of cells with the same value in a column.
     * 
     * @returns An array of cell group objects, each containing:
     *          - start: The starting row index of the group
     *          - end: The ending row index of the group
     *          - value: The value of the cells in the group
     *          - col: The column index of the group
     */
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

    public getUniqueColumnValues(col: number): CellValue[] {
        const columnValues = this.data.slice(2).map(row => row[col]);
        return [...new Set(columnValues)].filter(value => value !== '');
    }
}
