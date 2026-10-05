import { createContext } from 'react';

// 只放 Context 对象本身，不含任何组件（配合 Fast Refresh 的要求）
export const AuthContext = createContext(null);
