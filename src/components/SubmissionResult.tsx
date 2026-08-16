import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { BulkRow } from '../types';

interface Props {
  rows: BulkRow[];
}

export function SubmissionResult({ rows }: Props) {
  const success = rows.filter((r) => r.status === 'success').length;
  const failed = rows.filter((r) => r.status === 'error').length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {failed === 0 ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle className="w-5 h-5" />
              All {success} entries created successfully
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-warning">
              <AlertTriangle className="w-5 h-5" />
              {success} of {rows.length} entries created successfully
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {failed > 0 && (
        <CardContent>
          <ul className="space-y-1">
            {rows
              .filter((r) => r.status === 'error')
              .map((r, i) => (
                <li key={r.id} className="flex items-start gap-1.5 text-sm text-destructive">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Row {i + 1} failed: {r.errorMessage || 'Unknown error'}
                  </span>
                </li>
              ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
