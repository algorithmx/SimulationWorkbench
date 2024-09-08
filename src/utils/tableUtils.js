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

export const createNewTable = (toolOptions, data) => ({
    id: Date.now(),
    data: [
        [{ value: toolOptions[0], colspan: 1 }],
        ['PNew'],
        ...data.slice(2).map(row => row.map(() => ''))
    ]
});

export const addColumn = (table, columnIndex) => ({
    ...table,
    data: table.data.map((row, rowIndex) => {
        if (rowIndex === 0) {
            return [{ ...row[0], colspan: row[0].colspan + 1 }];
        }
        const newCell = rowIndex === 1 ? 'PNew' : '';
        return [...row.slice(0, columnIndex + 1), newCell, ...row.slice(columnIndex + 1)];
    })
});

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