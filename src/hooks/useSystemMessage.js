import { useState, useCallback } from 'react';

const useSystemMessage = (initialMessage = '') => {
  const [systemMessages, setSystemMessages] = useState([initialMessage]);

  const updateSystemMessage = useCallback((message) => {
    setSystemMessages(prevMessages => [...prevMessages, message]);
  }, []);

  return { systemMessages, updateSystemMessage };
};

export default useSystemMessage;