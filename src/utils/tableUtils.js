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


export function getTableToolName(table) {
  if (table && table.data && table.data.length > 0) {
    const firstRow = table.data[0];
    if (firstRow.length > 0) {
      const firstCell = firstRow[0];
      return firstCell.value;
    }
  }
  return 'Unknown';
}

export const calculateCellGroups = (data) => {
  const groups = [];
  const valueRows = data.slice(2);
  const columnCount = data[1].length;

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
};

export const createNewTable = (toolOptions, data, onUpdateSystemMessage) => {
  const tmp_id = Date.now();
  onUpdateSystemMessage(`Create a new table [${Object.keys(toolOptions)[0]}] (id=${tmp_id})`);
  return {
    id: tmp_id,
    data: [
        [{ value: Object.keys(toolOptions)[0], colspan: 1 }],
        ['PNew'],
        ...data.slice(2).map(row => row.map(() => ''))
    ]
  };
}

export const addColumn = (table, columnIndex) => {
  return {
    ...table,
    data: table.data.map((row, rowIndex) => {
        if (rowIndex === 0) {
            return [{ ...row[0], colspan: row[0].colspan + 1 }];
        }
        const newCell = rowIndex === 1 ? 'PNew' : '';
        return [...row.slice(0, columnIndex + 1), newCell, ...row.slice(columnIndex + 1)];
    })
  }
};

export const deleteColumn = (table, columnIndex) => {
    const columnCount = table.data[1].length;
    if (columnCount === 1) {
        return table;
    }
    return {
        ...table,
        data: table.data.map((row, rowIndex) => {
            if (rowIndex === 0) {
                return [{ ...row[0], colspan: row[0].colspan - 1 }];
            }
            return [...row.slice(0, columnIndex), ...row.slice(columnIndex + 1)];
        })
    };
};