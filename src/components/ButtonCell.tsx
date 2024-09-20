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

import { Cell, CellTemplate, Uncertain, Compatible } from '@silevis/reactgrid';

export interface ButtonCell extends Cell {
    type: 'button';
    text: string;
    status?: string;
    onClick: (rowIndex: number) => void;
}

export class ButtonCellTemplate implements CellTemplate<ButtonCell> {
    getCompatibleCell(uncertainCell: Uncertain<ButtonCell>): Compatible<ButtonCell> {
        return {
            type: 'button',
            text: uncertainCell.text || '',
            status: uncertainCell.status || '',
            value: NaN,
            onClick: uncertainCell.onClick || (() => {}),
        };
    }

    // @ts-ignore
    render(cell: Compatible<ButtonCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<ButtonCell>, commit: boolean) => void): React.ReactNode {
        return (
            <button
                onClick={() => cell.onClick(Number(cell.text))}
                className="rg-button-cell"
            >
                {cell.status}
            </button>
        );
    }
}

