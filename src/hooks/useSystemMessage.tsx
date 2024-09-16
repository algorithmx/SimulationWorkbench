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

import { useState, useCallback } from 'react';

interface SystemMessageHook {
  systemMessages: string[];
  updateSystemMessage: (message: string) => void;
}

const useSystemMessage = (initialMessage: string = ''): SystemMessageHook => {
  const [systemMessages, setSystemMessages] = useState<string[]>([initialMessage]);

  const updateSystemMessage = useCallback((message: string): void => {
    setSystemMessages(prevMessages => [...prevMessages, message]);
  }, []);

  return { systemMessages, updateSystemMessage };
};

export default useSystemMessage;