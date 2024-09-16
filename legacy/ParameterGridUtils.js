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


import React from 'react';

export function createParameterGrid(paramValues, defaultToolName, newTableId) {
    const validParams = paramValues.filter(param => param.name.trim() !== '' && param.value.trim() !== '');
    
    if (validParams.length === 0) {
        alert('Please add at least one parameter with both name and value.');
        return null;
    }

    const gridData = [
        [{ value: defaultToolName, colspan: validParams.length + 1 }],
        [...validParams.map(param => param.name), ''],
        ...generateCombinations(validParams).map(row => [...row, '']),
    ];

    return {
        id: newTableId,
        data: gridData
    };
}

export function generateCombinations(paramValues) {
    const values = paramValues.map(param => param.value.split(',').map(s => s.trim()));
    return cartesianProduct(values);
}

function cartesianProduct(arrays) {
    return arrays.reduce((acc, array) => (
        acc.flatMap(x => array.map(y => [...x, y]))
    ), [[]]);
}

export function ParamInputRow({ param, onChange }) {
    return (
        <div className="param-input-row">
            <input
                type="text"
                value={param.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Parameter name"
                autoComplete="off"
            />
            <input
                type="text"
                value={param.value}
                onChange={(e) => onChange('value', e.target.value)}
                placeholder="Values (comma-separated)"
                autoComplete="off"
            />
        </div>
    );
}