import { useReducer, useCallback } from 'react';
import type { BulkRow } from '../types';

interface RowState {
  rows: BulkRow[];
  date: string;
}

type RowAction =
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_ROWS'; rows: BulkRow[] }
  | { type: 'ADD_ROW' }
  | { type: 'REMOVE_ROW'; id: string }
  | { type: 'UPDATE_ROW'; id: string; field: keyof BulkRow; value: string | number | null }
  | { type: 'DUPLICATE_ROW'; id: string }
  | { type: 'SET_STATUS'; id: string; status: BulkRow['status']; errorMessage?: string };

function createEmptyRow(date: string): BulkRow {
  return {
    id: crypto.randomUUID(),
    begin: '',
    end: '',
    customerId: null,
    projectId: null,
    activityId: null,
    description: '',
    tags: '',
  };
}

function rowReducer(state: RowState, action: RowAction): RowState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, date: action.date };

    case 'SET_ROWS':
      return { ...state, rows: action.rows };

    case 'ADD_ROW':
      return { ...state, rows: [...state.rows, createEmptyRow(state.date)] };

    case 'REMOVE_ROW':
      return { ...state, rows: state.rows.filter((r) => r.id !== action.id) };

    case 'UPDATE_ROW':
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.id === action.id
            ? { ...r, [action.field]: action.value }
            : r
        ),
      };

    case 'DUPLICATE_ROW':
      const idx = state.rows.findIndex((r) => r.id === action.id);
      if (idx === -1) return state;
      const source = state.rows[idx];
      const dup: BulkRow = { ...source, id: crypto.randomUUID(), status: undefined, errorMessage: undefined };
      const newRows = [...state.rows];
      newRows.splice(idx + 1, 0, dup);
      return { ...state, rows: newRows };

    case 'SET_STATUS':
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.id === action.id
            ? { ...r, status: action.status, errorMessage: action.errorMessage }
            : r
        ),
      };

    default:
      return state;
  }
}

export function useBulkRows(initialDate: string) {
  const [state, dispatch] = useReducer(rowReducer, { rows: [createEmptyRow(initialDate)], date: initialDate });

  const setDate = useCallback((date: string) => dispatch({ type: 'SET_DATE', date }), []);
  const setRows = useCallback((rows: BulkRow[]) => dispatch({ type: 'SET_ROWS', rows }), []);
  const addRow = useCallback(() => dispatch({ type: 'ADD_ROW' }), []);
  const removeRow = useCallback((id: string) => dispatch({ type: 'REMOVE_ROW', id }), []);
  const updateRow = useCallback(
    (id: string, field: keyof BulkRow, value: string | number | null) =>
      dispatch({ type: 'UPDATE_ROW', id, field, value }),
    []
  );
  const duplicateRow = useCallback((id: string) => dispatch({ type: 'DUPLICATE_ROW', id }), []);
  const setRowStatus = useCallback(
    (id: string, status: BulkRow['status'], errorMessage?: string) =>
      dispatch({ type: 'SET_STATUS', id, status, errorMessage }),
    []
  );

  return {
    ...state,
    setDate,
    setRows,
    addRow,
    removeRow,
    updateRow,
    duplicateRow,
    setRowStatus,
  };
}
